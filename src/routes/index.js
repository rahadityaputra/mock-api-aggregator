import { Router } from 'express';
import authRoutes from './auth.js';
import marketplaceRoutes from './marketplace.js';
import webhookRoutes from './webhooks.js';

const router = Router();

// GET /health
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Mock E-Commerce API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    marketplaces: ['shopee', 'tokopedia', 'lazada'],
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// /api/auth/register, /api/auth/login, /api/auth/me
router.use('/auth', authRoutes);

// /api/:marketplace/* (shopee | tokopedia | lazada)
router.use('/:marketplace', marketplaceRoutes);

// /api/webhooks/:marketplace
router.use('/webhooks', webhookRoutes);

export default router;
