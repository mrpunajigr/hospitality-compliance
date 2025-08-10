#!/usr/bin/env node

const http = require('http');
const httpProxy = require('http-proxy');

console.log('Installing http-proxy if needed...');

// Create a simple proxy server that tunnels to Next.js
const proxy = httpProxy.createProxyServer({});

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Proxy to Next.js dev server
  proxy.web(req, res, {
    target: 'http://127.0.0.1:3003',
    changeOrigin: true,
    ws: true
  }, (err) => {
    console.log('Proxy error:', err.message);
    res.writeHead(503);
    res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>Dev Server Proxy</title>
  <style>
    body { font-family: system-ui; padding: 40px; background: #1e3c72; color: white; text-align: center; }
    .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 16px; }
    .error { background: rgba(239, 68, 68, 0.2); padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚧 Dev Server Proxy</h1>
    <div class="error">
      <h3>Connection Failed</h3>
      <p>Cannot connect to Next.js server at port 3003</p>
      <p>Error: ${err.message}</p>
    </div>
    <p>Make sure the Next.js dev server is running first.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>
    `);
  });
});

const PORT = 5555;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`
🔧 Development Proxy Server Started!

URL: http://127.0.0.1:${PORT}

This proxy tunnels to your Next.js dev server.
Make sure to start the Next.js server first with: node dev-server.js
  `);
});

// Handle WebSocket upgrades for hot reload
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head, {
    target: 'ws://127.0.0.1:3003'
  });
});