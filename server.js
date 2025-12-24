/* eslint-disable @typescript-eslint/no-require-imports */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const lanHost = process.env.TERMINAL_HOST || hostname;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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

  server.on('upgrade', (request, socket, head) => {
    upgrade(request, socket, head);
  });

  server.listen(port, '0.0.0.0', () => {
    if (lanHost !== hostname) {
      console.log(`> Ready on http://${lanHost}:${port} (LAN)`);
      console.log(`> Also available on http://${hostname}:${port} (local)`);
    } else {
      console.log(`> Ready on http://${hostname}:${port}`);
    }
  });
});
