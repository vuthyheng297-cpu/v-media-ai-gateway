const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const BACKEND_PORT = 3001;

// Set env for backend binary
process.env.PORT = BACKEND_PORT;
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'vmedia_secret_gateway_2026_key';

console.log(`[Master] Starting V-Media Backend on port ${BACKEND_PORT}...`);

// Determine binary to run (Linux on Render)
const backendBin = path.join(__dirname, 'new-api');
let backendProcess = null;

if (fs.existsSync(backendBin)) {
  fs.chmodSync(backendBin, 0o755);
  backendProcess = spawn(backendBin, [], {
    env: { ...process.env, PORT: BACKEND_PORT },
    stdio: 'inherit'
  });

  backendProcess.on('error', (err) => {
    console.error('[Backend] Failed to start:', err);
  });

  backendProcess.on('exit', (code) => {
    console.log(`[Backend] Exited with code ${code}`);
  });
} else {
  console.warn('[Backend] Binary not found at', backendBin);
}

const dist = path.join(__dirname, 'dist');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  const url = req.url;

  // Proxy API and Token traffic to New-API backend
  if (url.startsWith('/v1/') || url.startsWith('/api/') || url.startsWith('/setup') || url.startsWith('/static/')) {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend connecting...', detail: err.message }));
    });

    req.pipe(proxyReq);
    return;
  }

  // Serve V-Media Nisay UI
  let filePath = path.join(dist, url.split('?')[0]);
  if (url === '/' || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(dist, 'index.html');
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[V-Media Gateway] Running on port ${PORT}`);
});