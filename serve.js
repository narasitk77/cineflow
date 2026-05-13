// ============================================================
// CineFlow tiny static file server
// Usage: node serve.js
// Default port: 8899 (override with PORT env var)
// ============================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const port = process.env.PORT || 8899;
const root = __dirname;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.txt':  'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
  // Normalize and split off query string
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // Prevent directory traversal
  const safePath = path.normalize(path.join(root, urlPath));
  if (!safePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden');
    return;
  }

  fs.readFile(safePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found: ' + urlPath);
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mime[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log(`✓ CineFlow running at http://localhost:${port}`);
  console.log(`  Press Ctrl+C to stop`);
});
