/* eslint-disable @typescript-eslint/no-require-imports */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const pty = require('node-pty');
const os = require('os');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Shell to use
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

// Store active terminal sessions
const terminals = new Map();

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});


app.prepare().then(() => {
  const upgrade = app.getUpgradeHandler();

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // WebSocket server for terminal connections
  // Disable permessage-deflate to avoid occasional abrupt disconnects (1006)
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url, true);

    if (pathname === '/api/terminal') {
      // Handle terminal WebSocket connections
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      // Let Next.js handle HMR and other WebSocket connections
      upgrade(request, socket, head);
    }
  });

  wss.on('connection', (ws) => {
    console.log('Terminal WebSocket connected');
    let sentBinaryFrames = 0;
    let sentBinaryBytes = 0;

    // Heartbeat support (helps avoid mysterious 1006 disconnects)
    ws.isAlive = true;
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Create PTY immediately - no delay needed
    if (ws.readyState !== WebSocket.OPEN) {
      console.log(`WebSocket not open (readyState=${ws.readyState})`);
      return;
    }

    // Send ping
    try {
      ws.send(JSON.stringify({ type: 'ping', time: Date.now() }));
      console.log('Ping sent');
    } catch (e) {
      console.error('Failed to send ping:', e);
      return;
    }

    {

      // Create a new PTY process
      const cwd = process.env.HOME || '/home';
      console.log(`Starting shell: ${shell} in ${cwd}`);

    // Force interactive bash so it prints a prompt reliably.
    const args = shell === 'bash' ? ['-i'] : [];

    let ptyProcess;
    try {
      ptyProcess = pty.spawn(shell, args, {
        name: 'xterm-256color',
        cols: 80,
        rows: 24,
        cwd,
        // Emit raw bytes so we can forward them as binary WS frames
        encoding: null,
        env: {
          ...process.env,
          TERM: 'xterm-256color',
        },
      });
    } catch (err) {
      console.error('Failed to spawn PTY:', err);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to start terminal' }));
      ws.close();
      return;
    }

    const terminalId = Date.now().toString();
    terminals.set(terminalId, { pty: ptyProcess, ws });

    console.log(`Terminal ${terminalId} created with PID ${ptyProcess.pid}`);

    // Send PTY output to WebSocket (binary frames)
    ptyProcess.onData((data) => {
      try {
        if (ws.readyState !== WebSocket.OPEN) return;

        // When `encoding: null`, node-pty gives us a Buffer. Forward it as binary.
        if (Buffer.isBuffer(data)) {
          sentBinaryFrames += 1;
          sentBinaryBytes += data.length;
          ws.send(data);
          return;
        }

        // Fallback if node-pty ever returns a string
        ws.send(Buffer.from(String(data), 'utf8'));
      } catch (err) {
        console.error('Error sending to WebSocket:', err);
      }
    });

    ptyProcess.onExit(({ exitCode, signal }) => {
      console.log(`Terminal ${terminalId} exited - code: ${exitCode}, signal: ${signal}`);
      terminals.delete(terminalId);
       if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'exit', exitCode, signal }));
        // Don't close WebSocket immediately - let client handle reconnect if desired
      }
    });

    // Handle incoming WebSocket messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'input':
            // Direct input to PTY
            ptyProcess.write(data.data);
            break;

           case 'resize':
             // Resize PTY
             if (Number.isFinite(data.cols) && Number.isFinite(data.rows) && data.cols > 0 && data.rows > 0) {
               ptyProcess.resize(data.cols, data.rows);
             }
             break;

          case 'command':
            // Execute a command (with newline)
            ptyProcess.write(data.command + '\n');
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });

    ws.on('close', (code, reason) => {
      console.log(
        `Terminal ${terminalId} WebSocket closed - code: ${code}, reason: ${reason?.toString?.() || ''}, sentBinaryFrames: ${sentBinaryFrames}, sentBinaryBytes: ${sentBinaryBytes}`
      );
      ptyProcess.kill();
      terminals.delete(terminalId);
    });

    ws.on('error', (err) => {
      console.error(`Terminal ${terminalId} WebSocket error:`, err);
      ptyProcess.kill();
      terminals.delete(terminalId);
    });

    // Don't send anything initially - just establish the connection
    console.log('Connection established, waiting for client...');

    // Send connection confirmation after a delay
    setTimeout(() => {
      if (ws.readyState === WebSocket.OPEN) {
        console.log('Sending connected message...');
        ws.send(JSON.stringify({ type: 'connected', terminalId }));
      } else {
        console.log('WS already closed before we could send connected message');
      }
    }, 200);
    }
  });

  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Terminal WebSocket available at ws://${hostname}:${port}/api/terminal`);
  });
});

// Cleanup on exit
process.on('SIGTERM', () => {
  console.log('SIGTERM received, cleaning up terminals...');
  for (const { pty } of terminals.values()) {
    pty.kill();
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, cleaning up terminals...');
  for (const { pty } of terminals.values()) {
    pty.kill();
  }
  process.exit(0);
});

