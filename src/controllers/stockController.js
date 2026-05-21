/**
 * stockController.js
 * HTTP handlers for stock management — single and bulk updates,
 * webhook configuration, test webhook, reset, error simulation, and status.
 */

import * as stockService from '../services/stockService.js';
import * as webhookService from '../services/webhookService.js';
import { sendSuccess, sendError } from '../utils/responses.js';
import { productStores } from '../models/Product.js';
import { orders } from '../models/Order.js';
import { errorSimulation, webhookConfigs } from '../models/WebhookConfig.js';
import { MARKETPLACES, ERROR_MODES } from '../config/constants.js';

// ─── Stock Update Handlers ────────────────────────────────────────────────────

/**
 * PUT /api/:marketplace/stock/:sku
 * Update stock for a single SKU.
 *
 * Body: { stock: number }
 */
export const updateStock = (req, res, next) => {
  try {
    const { marketplace, sku } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return sendError(res, '"stock" field is required in request body', 400);
    }

    const numericStock = Number(stock);
    if (isNaN(numericStock)) {
      return sendError(res, '"stock" must be a valid number', 400);
    }

    const updatedProduct = stockService.updateSingleStock(marketplace, sku, numericStock);

    return sendSuccess(
      res,
      {
        sku,
        newStock: numericStock,
        product: updatedProduct,
        updatedAt: updatedProduct.updatedAt,
      },
      `Stock updated for SKU "${sku}" in ${marketplace}`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/:marketplace/stock/bulk
 * Bulk update stock for multiple SKUs.
 *
 * Body: { updates: [{ sku: string, stock: number }, ...] }
 */
export const bulkUpdateStock = (req, res, next) => {
  try {
    const { marketplace } = req.params;
    const { updates } = req.body;

    if (!updates) {
      return sendError(res, '"updates" array is required in request body', 400);
    }

    const result = stockService.bulkUpdateStock(marketplace, updates);

    const status = result.failureCount === 0 ? 200 : result.successCount === 0 ? 422 : 207;

    return res.status(status).json({
      success: result.successCount > 0,
      message: `Bulk stock update: ${result.successCount} succeeded, ${result.failureCount} failed`,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Webhook Handlers ─────────────────────────────────────────────────────────

/**
 * POST /api/:marketplace/webhook/config
 * Configure the webhook URL for a marketplace.
 *
 * Body: { url, secret?, events?, enabled? }
 */
export const configureWebhook = (req, res, next) => {
  try {
    const { marketplace } = req.params;

    if (!Object.values(MARKETPLACES).includes(marketplace)) {
      return sendError(res, `Invalid marketplace: ${marketplace}`, 400);
    }

    const { url, secret, events, enabled } = req.body;

    if (!url) {
      return sendError(res, '"url" is required', 400);
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return sendError(res, '"url" must be a valid URL (include http:// or https://)', 400);
    }

    const config = webhookService.configureWebhook(marketplace, {
      url,
      ...(secret !== undefined && { secret }),
      ...(events !== undefined && { events }),
      ...(enabled !== undefined && { enabled }),
    });

    return sendSuccess(res, { config }, `Webhook configured for ${marketplace}`);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/:marketplace/webhook/test
 * Send a test webhook to the configured URL.
 */
export const testWebhook = async (req, res, next) => {
  try {
    const { marketplace } = req.params;

    if (!Object.values(MARKETPLACES).includes(marketplace)) {
      return sendError(res, `Invalid marketplace: ${marketplace}`, 400);
    }

    const result = await webhookService.sendTestWebhook(marketplace);
    const config = webhookService.getWebhookConfig(marketplace);

    const message = result.delivered
      ? `Test webhook delivered successfully to ${config?.url}`
      : `Test webhook failed: ${result.error}`;

    return sendSuccess(res, { deliveryResult: result, webhookUrl: config?.url }, message);
  } catch (err) {
    next(err);
  }
};

// ─── Marketplace Operations ───────────────────────────────────────────────────

/**
 * POST /api/:marketplace/reset
 * Reset all marketplace data back to seed state.
 * WARNING: This deletes all orders and resets all stock.
 */
export const resetMarketplace = async (req, res, next) => {
  try {
    const { marketplace } = req.params;

    if (!Object.values(MARKETPLACES).includes(marketplace)) {
      return sendError(res, `Invalid marketplace: ${marketplace}`, 400);
    }

    // Dynamically re-import seed data to get fresh copies
    // We reload the module to get fresh seed data
    const { shopeeProducts, tokopediaProducts, lazadaProducts } = await import('../models/Product.js');

    // Reset stock to original values per marketplace
    const stockResets = {
      shopee: [150, 320, 88, 75, 200, 112],
      tokopedia: [65, 30, 480, 45, 150, 88],
      lazada: [95, 200, 22, 40, 300, 175],
    };

    const store = productStores[marketplace];
    const stockFieldMap = { shopee: 'stock', tokopedia: 'stock', lazada: 'available' };
    const stockField = stockFieldMap[marketplace];
    const defaultStocks = stockResets[marketplace];

    // Reset stock for each product
    store.forEach((product, index) => {
      if (defaultStocks[index] !== undefined) {
        product[stockField] = defaultStocks[index];
        product.updatedAt = new Date().toISOString();
      }
    });

    // Remove orders belonging to this marketplace
    const removedOrderCount = orders.filter((o) => o.marketplace === marketplace).length;
    // Splice out marketplace orders in-place
    for (let i = orders.length - 1; i >= 0; i--) {
      if (orders[i].marketplace === marketplace) {
        orders.splice(i, 1);
      }
    }

    // Reset error simulation
    errorSimulation[marketplace] = ERROR_MODES.NONE;

    return sendSuccess(
      res,
      {
        marketplace,
        productsReset: store.length,
        ordersRemoved: removedOrderCount,
        errorSimulationReset: true,
      },
      `Marketplace "${marketplace}" has been reset to initial state`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/:marketplace/simulate-error
 * Configure the error simulation mode for a marketplace.
 *
 * Body: { mode: 'none' | 'rate_limit' | 'timeout' | 'server_error' | 'auth_failure' }
 */
export const simulateError = (req, res, next) => {
  try {
    const { marketplace } = req.params;
    const { mode } = req.body;

    if (!Object.values(MARKETPLACES).includes(marketplace)) {
      return sendError(res, `Invalid marketplace: ${marketplace}`, 400);
    }

    const validModes = Object.values(ERROR_MODES);
    if (!mode || !validModes.includes(mode)) {
      return sendError(
        res,
        `"mode" must be one of: ${validModes.join(', ')}`,
        400
      );
    }

    errorSimulation[marketplace] = mode;

    const message =
      mode === ERROR_MODES.NONE
        ? `Error simulation disabled for ${marketplace}`
        : `Error simulation set to "${mode}" for ${marketplace}`;

    return sendSuccess(res, { marketplace, mode }, message);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/:marketplace/status
 * Get the current status of a marketplace (product count, order count, simulation mode, webhook config).
 */
export const getStatus = (req, res, next) => {
  try {
    const { marketplace } = req.params;

    if (!Object.values(MARKETPLACES).includes(marketplace)) {
      return sendError(res, `Invalid marketplace: ${marketplace}`, 400);
    }

    const store = productStores[marketplace];
    const marketplaceOrders = orders.filter((o) => o.marketplace === marketplace);
    const webhookConfig = webhookService.getWebhookConfig(marketplace);
    const simMode = errorSimulation[marketplace];

    // Calculate total stock across all products
    const stockFieldMap = { shopee: 'stock', tokopedia: 'stock', lazada: 'available' };
    const stockField = stockFieldMap[marketplace];
    const totalStock = store.reduce((sum, p) => sum + (p[stockField] || 0), 0);

    return sendSuccess(
      res,
      {
        marketplace,
        status: simMode === ERROR_MODES.NONE ? 'operational' : `degraded (${simMode})`,
        errorSimulationMode: simMode,
        products: {
          total: store.length,
          totalStock,
        },
        orders: {
          total: marketplaceOrders.length,
        },
        webhook: webhookConfig
          ? { url: webhookConfig.url, enabled: webhookConfig.enabled }
          : null,
        checkedAt: new Date().toISOString(),
      },
      `Status retrieved for ${marketplace}`
    );
  } catch (err) {
    next(err);
  }
};
