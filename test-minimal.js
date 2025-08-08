const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Minimal Test Server</title>
      <style>
        body { font-family: system-ui; padding: 40px; background: #1e3c72; color: white; text-align: center; }
        .container { max-width: 500px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ SUCCESS!</h1>
        <p>Basic Node.js HTTP server is working</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>This proves the issue is specific to Next.js</p>
      </div>
    </body>
    </html>
  `);
});

const PORT = 3333;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🧪 MINIMAL TEST SERVER RUNNING

URL: http://localhost:${PORT}
URL: http://127.0.0.1:${PORT}
URL: http://192.168.1.100:${PORT}

Binding to all interfaces to bypass localhost issue.
  `);
});

server.on('error', (err) => {
  console.error('Server error:', err);
});