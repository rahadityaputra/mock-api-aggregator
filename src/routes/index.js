/**
 * index.js
 * Root router — mounts all sub-routers and handles the health check.
 */

import { Router } from 'express';
import authRoutes from './auth.js';
import marketplaceRoutes from './marketplace.js';

const router = Router();

// ── Health Check ──────────────────────────────────────────────────────────────
// GET /health — Simple liveness probe (no auth required)
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Mock Marketplace API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    marketplaces: ['shopee', 'tokopedia', 'lazada'],
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Auth Routes ───────────────────────────────────────────────────────────────
// /api/auth/register, /api/auth/login, /api/auth/me
router.use('/auth', authRoutes);

// ── Marketplace Routes ────────────────────────────────────────────────────────
// /api/:marketplace/* (shopee | tokopedia | lazada)
router.use('/:marketplace', marketplaceRoutes);

export default router;
