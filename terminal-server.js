/* eslint-disable @typescript-eslint/no-require-imports */

const WebSocket = require('ws');
const { WebSocketServer } = WebSocket;
const pty = require('node-pty');
const os = require('os');

const hostname = process.env.TERMINAL_HOST || 'localhost';
const port = parseInt(process.env.TERMINAL_PORT || process.env.PORT || '4000', 10);

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

// WebSocket server for terminal connections
// Disable permessage-deflate to avoid occasional abrupt disconnects (1006)
const wss = new WebSocketServer({ port, path: '/api/terminal', perMessageDeflate: false });

const HEARTBEAT_INTERVAL_MS = 30000;
const HEARTBEAT_GRACE_MS = HEARTBEAT_INTERVAL_MS * 2;

wss.on('connection', (ws) => {
  console.log('Terminal WebSocket connected');
  let sentBinaryFrames = 0;
  let sentBinaryBytes = 0;
  let terminalId = null;
  let ptyProcess = null;

  // Heartbeat support (helps avoid mysterious 1006 disconnects)
  ws.isAlive = true;
  ws.lastSeen = Date.now();
  ws.on('pong', () => {
    ws.isAlive = true;
    ws.lastSeen = Date.now();
  });

  const startPty = () => {
    if (ptyProcess) return;
    if (ws.readyState !== WebSocket.OPEN) {
      console.log(`WebSocket not open (readyState=${ws.readyState})`);
      return;
    }

    // Create a new PTY process
    const cwd = process.env.HOME || '/home';
    console.log(`Starting shell: ${shell} in ${cwd}`);

    // Force interactive bash so it prints a prompt reliably.
    const args = shell === 'bash' ? ['-i'] : [];

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

    terminalId = Date.now().toString();
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
      if (terminalId) terminals.delete(terminalId);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'exit', exitCode, signal }));
        // Don't close WebSocket immediately - let client handle reconnect if desired
      }
    });

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'connected', terminalId }));
    }
  };

  // Handle incoming WebSocket messages
  ws.on('message', (message) => {
    ws.isAlive = true;
    ws.lastSeen = Date.now();
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case 'init':
          startPty();
          break;
        case 'ping':
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'pong', time: data.time || Date.now() }));
          }
          break;
        case 'pong':
          // Keepalive response, no-op
          break;
        case 'input':
          if (!ptyProcess) startPty();
          if (!ptyProcess) break;
          // Direct input to PTY
          ptyProcess.write(data.data);
          break;

        case 'resize':
          if (!ptyProcess) startPty();
          if (!ptyProcess) break;
          // Resize PTY
          if (Number.isFinite(data.cols) && Number.isFinite(data.rows) && data.cols > 0 && data.rows > 0) {
            ptyProcess.resize(data.cols, data.rows);
          }
          break;

        case 'command':
          if (!ptyProcess) startPty();
          if (!ptyProcess) break;
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
    if (ptyProcess) {
      ptyProcess.kill();
    }
    if (terminalId) {
      terminals.delete(terminalId);
    }
  });

  ws.on('error', (err) => {
    console.error(`Terminal ${terminalId} WebSocket error:`, err);
    if (ptyProcess) {
      ptyProcess.kill();
    }
    if (terminalId) {
      terminals.delete(terminalId);
    }
  });
});

const heartbeatInterval = setInterval(() => {
  const now = Date.now();
  wss.clients.forEach((ws) => {
    const lastSeen = ws.lastSeen ?? 0;
    if (now - lastSeen > HEARTBEAT_GRACE_MS) {
      console.log('Terminating idle terminal socket');
      return ws.terminate();
    }
    ws.isAlive = false;
    try {
      ws.ping();
    } catch (err) {
      console.error('WebSocket ping failed:', err);
      ws.terminate();
    }
  });
}, HEARTBEAT_INTERVAL_MS);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

console.log(`> Terminal WebSocket available at ws://${hostname}:${port}/api/terminal`);

function shutdown(signal) {
  console.log(`${signal} received, cleaning up terminals...`);
  for (const { pty } of terminals.values()) {
    pty.kill();
  }
  wss.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
