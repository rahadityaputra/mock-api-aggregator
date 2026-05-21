import * as productService from '../services/productService.js';
import { sendSuccess, sendPaginated, sendError } from '../utils/responses.js';
import { errorSimulation } from '../models/WebhookConfig.js';

/**
 * GET /api/:marketplace/products
 * List all products for a marketplace with optional filters.
 *
 * Query params: page, limit, category, search, minPrice, maxPrice
 */
export const listProducts = (req, res, next) => {
  try {
    const { marketplace } = req.params;

    const simError = checkSimulatedError(marketplace, res);
    if (simError) return;

    const { products, total, page, limit } = productService.listProducts(
      marketplace,
      req.query
    );

    return sendPaginated(
      res,
      products,
      total,
      page,
      limit,
      `Produk berhasil diambil dari ${marketplace}`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/:marketplace/products/:id
 * Get a single product by its marketplace-native ID.
 */
export const getProduct = (req, res, next) => {
  try {
    const { marketplace, id } = req.params;

    const simError = checkSimulatedError(marketplace, res);
    if (simError) return;

    const product = productService.getProductById(marketplace, id);
    return sendSuccess(res, { product }, `Produk berhasil diambil dari ${marketplace}`);
  } catch (err) {
    next(err);
  }
};

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Inspect the error simulation mode for a marketplace and respond accordingly.
 * Returns true if a simulated error was sent (caller should stop processing).
 *
 * @param {string} marketplace
 * @param {object} res 
 * @returns {boolean}
 */
const checkSimulatedError = (marketplace, res) => {
  const mode = errorSimulation[marketplace];

  switch (mode) {
    case 'rate_limit':
      res.status(429).json({
        success: false,
        message: '[SIMULATED] Rate limit exceeded. Too many requests.',
        retryAfter: 60,
        timestamp: new Date().toISOString(),
      });
      return true;

    case 'timeout':
      res.status(503).json({
        success: false,
        message: '[SIMULATED] Request timed out. Please try again.',
        timestamp: new Date().toISOString(),
      });
      return true;

    case 'server_error':
      res.status(500).json({
        success: false,
        message: '[SIMULATED] Internal server error from marketplace.',
        timestamp: new Date().toISOString(),
      });
      return true;

    case 'auth_failure':
      res.status(401).json({
        success: false,
        message: '[SIMULATED] Authentication token invalid or expired.',
        timestamp: new Date().toISOString(),
      });
      return true;

    default:
      return false;
  }
};

export { checkSimulatedError };
