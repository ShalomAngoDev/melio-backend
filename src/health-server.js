const http = require('http');

const PORT = process.env.PORT || 3000;
const HEALTH_PATH = '/api/v1/health/basic';

console.log('🏥 Starting standalone health check server...');
console.log(`Port: ${PORT}`);
console.log(`Health path: ${HEALTH_PATH}`);

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  if (req.url === HEALTH_PATH && req.method === 'GET') {
    // Health check - respond immediately
    console.log('Health check requested - responding');
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
    // For all other routes, return a simple response
    console.log('Other request - responding with basic info');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Health server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }));
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
