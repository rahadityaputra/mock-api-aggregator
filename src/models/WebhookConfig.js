/**
 * WebhookConfig.js
 * In-memory webhook configuration store per marketplace.
 */

// ─── Default Config ───────────────────────────────────────────────────────────

/**
 * Stores one webhook URL per marketplace.
 * Keyed by marketplace name.
 */
export const webhookConfigs = {
  shopee: {
    url: process.env.DEFAULT_WEBHOOK_URL || 'http://localhost:3000/api/webhook',
    enabled: true,
    secret: 'shp_webhook_secret_key',
    events: ['order.created', 'stock.updated'],
    configuredAt: new Date().toISOString(),
  },
  tokopedia: {
    url: process.env.DEFAULT_WEBHOOK_URL || 'http://localhost:3000/api/webhook',
    enabled: true,
    secret: 'tok_webhook_secret_key',
    events: ['order.created', 'stock.updated'],
    configuredAt: new Date().toISOString(),
  },
  lazada: {
    url: process.env.DEFAULT_WEBHOOK_URL || 'http://localhost:3000/api/webhook',
    enabled: true,
    secret: 'lzd_webhook_secret_key',
    events: ['order.created', 'stock.updated'],
    configuredAt: new Date().toISOString(),
  },
};

// ─── Error Simulation State ───────────────────────────────────────────────────

/**
 * Per-marketplace error simulation mode.
 * Set via POST /api/:marketplace/simulate-error
 */
export const errorSimulation = {
  shopee: 'none',
  tokopedia: 'none',
  lazada: 'none',
};
