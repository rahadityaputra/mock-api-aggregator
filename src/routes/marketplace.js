/**
 * marketplace.js
 * All marketplace-scoped routes under /api/:marketplace
 * Marketplace param is validated at the router level.
 */

import { Router } from 'express';
import { listProducts, getProduct } from '../controllers/productController.js';
import { createOrder, listOrders, getOrder } from '../controllers/orderController.js';
import {
  updateStock,
  bulkUpdateStock,
  configureWebhook,
  testWebhook,
  resetMarketplace,
  simulateError,
  getStatus,
} from '../controllers/stockController.js';
import { authenticate } from '../middleware/authentication.js';
import { sendError } from '../utils/responses.js';

const router = Router({ mergeParams: true });

// ── Marketplace param validation ──────────────────────────────────────────────
// Runs before every route in this file
router.param('marketplace', (req, res, next, value) => {
  const valid = ['shopee', 'tokopedia', 'lazada'];
  if (!valid.includes(value)) {
    return sendError(
      res,
      `Invalid marketplace "${value}". Valid options: ${valid.join(', ')}`,
      400
    );
  }
  next();
});

// ── Products ──────────────────────────────────────────────────────────────────
// GET  /api/:marketplace/products         — List products (filterable, paginated)
// GET  /api/:marketplace/products/:id     — Get product by marketplace-native ID
router.get('/products', listProducts);
router.get('/products/:id', getProduct);

// ── Orders ────────────────────────────────────────────────────────────────────
// POST /api/:marketplace/orders           — Create order (auth required)
// GET  /api/:marketplace/orders           — List user's orders (auth required)
// GET  /api/:marketplace/orders/:id       — Get specific order (auth required)
router.post('/orders', authenticate, createOrder);
router.get('/orders', authenticate, listOrders);
router.get('/orders/:id', authenticate, getOrder);

// ── Stock Management ──────────────────────────────────────────────────────────
// PUT  /api/:marketplace/stock/bulk       — Bulk stock update (MUST be before /:sku)
// PUT  /api/:marketplace/stock/:sku       — Single SKU stock update
router.put('/stock/bulk', authenticate, bulkUpdateStock);
router.put('/stock/:sku', authenticate, updateStock);

// ── Webhook ───────────────────────────────────────────────────────────────────
// POST /api/:marketplace/webhook/config   — Set webhook URL + options
// POST /api/:marketplace/webhook/test     — Fire test webhook
router.post('/webhook/config', authenticate, configureWebhook);
router.post('/webhook/test', authenticate, testWebhook);

// ── Marketplace Operations ────────────────────────────────────────────────────
// POST /api/:marketplace/reset            — Reset all data to seed state
// POST /api/:marketplace/simulate-error  — Enable/disable error simulation
// GET  /api/:marketplace/status           — Health/status of marketplace
router.post('/reset', resetMarketplace);
router.post('/simulate-error', simulateError);
router.get('/status', getStatus);

export default router;
