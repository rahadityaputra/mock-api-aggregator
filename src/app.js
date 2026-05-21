import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Security & CORS 
app.use(
  cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Marketplace', 'X-Webhook-Secret'],
    credentials: false,
  })
);

// Body Parsing 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// Root Info Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Mock Marketplace API',
    version: '1.0.0',
    description: 'Mock API untuk Shopee, Tokopedia, and Lazada',
    baseUrl: '/api',
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
      },
      marketplace: {
        note: 'Replace :marketplace with shopee | tokopedia | lazada',
        products: {
          list: 'GET /api/:marketplace/products',
          detail: 'GET /api/:marketplace/products/:id',
        },
        orders: {
          create: 'POST /api/:marketplace/orders',
          list: 'GET /api/:marketplace/orders',
          detail: 'GET /api/:marketplace/orders/:id',
        },
        stock: {
          updateSingle: 'PUT /api/:marketplace/stock/:sku',
          bulkUpdate: 'PUT /api/:marketplace/stock/bulk',
        },
        webhook: {
          configure: 'POST /api/:marketplace/webhook/config',
          test: 'POST /api/:marketplace/webhook/test',
        },
        operations: {
          status: 'GET /api/:marketplace/status',
          reset: 'POST /api/:marketplace/reset',
          simulateError: 'POST /api/:marketplace/simulate-error',
        },
      },
    },
  });
});

// API Routes 
app.use('/api', apiRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Mock Marketplace API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Error Handling 
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
