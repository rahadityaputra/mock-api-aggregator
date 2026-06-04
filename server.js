import 'dotenv/config';

import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

await connectDatabase();

const server = app.listen(PORT, HOST, () => {
  const divider = '─'.repeat(60);

  console.log(`\n${divider}`);
  console.log(' Mock Marketplace API');
  console.log(divider);
  console.log(`  Status    : Running`);
  console.log(`  Base URL  : http://localhost:${PORT}/api`);
  console.log(`  Health    : http://localhost:${PORT}/health`);
  console.log(`  Webhooks  : http://localhost:${PORT}/api/webhooks/:marketplace`);
  console.log(`  Markets   : shopee  |  tokopedia  |  lazada`);
  console.log(`  Env       : ${process.env.NODE_ENV || 'development'}`);
  console.log(`${divider}\n`);

  console.log('  Endpoints:');
  console.log(`  POST  http://localhost:${PORT}/api/auth/login`);
  console.log(`  POST  http://localhost:${PORT}/api/auth/register`);
  console.log(`  GET   http://localhost:${PORT}/api/auth/me`);
  console.log(`  GET   http://localhost:${PORT}/api/shopee/products`);
  console.log(`  GET   http://localhost:${PORT}/api/tokopedia/products`);
  console.log(`  GET   http://localhost:${PORT}/api/lazada/products`);
  console.log(`\n${divider}\n`);
});

const shutdown = (signal) => {
  console.log(`\n[SERVER] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[SERVER] HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[SERVER] Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER] Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[SERVER] Uncaught Exception:', err.message);
  process.exit(1);
});

export default server;
