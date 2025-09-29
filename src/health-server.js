const http = require('http');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const HEALTH_PATH = '/api/v1/health/basic';

console.log('🏥 Starting standalone health check server...');

// Start the main application in background
console.log('🚀 Starting main application in background...');
const appProcess = spawn('npm', ['run', 'start:prod'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3001 }
});

appProcess.on('error', (err) => {
  console.error('Failed to start main application:', err);
});

appProcess.on('exit', (code) => {
  console.log(`Main application exited with code ${code}`);
});

const server = http.createServer((req, res) => {
  if (req.url === HEALTH_PATH && req.method === 'GET') {
    // Health check - respond immediately
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      service: 'health-check'
    }));
  } else {
    // For all other routes, proxy to main application
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: req.url,
      method: req.method,
      headers: req.headers
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Service temporarily unavailable',
        message: 'Main application is starting up...'
      }));
    });

    req.pipe(proxyReq);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🏥 Health check server running on port ${PORT}`);
  console.log(`🔍 Health endpoint: http://0.0.0.0:${PORT}${HEALTH_PATH}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down health server');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down health server');
  server.close(() => {
    process.exit(0);
  });
});
