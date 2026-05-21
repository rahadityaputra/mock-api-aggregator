import * as orderService from '../services/orderService.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/responses.js';
import { checkSimulatedError } from './productController.js';

/**
 * POST /api/:marketplace/orders
 * Create a new order. Requires authentication.
 *
 * Body: { productId, quantity, shippingAddress? }
 */
export const createOrder = (req, res, next) => {
  try {
    const { marketplace } = req.params;

    const simError = checkSimulatedError(marketplace, res);
    if (simError) return;

    const order = orderService.placeOrder(marketplace, req.user.id, req.body);

    return sendCreated(
      res,
      { order },
      `Order berhasil dibuat di ${marketplace}`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/:marketplace/orders
 * List all orders for the authenticated user in a marketplace.
 *
 * Query params: page, limit, status
 */
export const listOrders = (req, res, next) => {
  try {
    const { marketplace } = req.params;

    const { orders, total, page, limit } = orderService.getUserOrders(
      marketplace,
      req.user.id,
      req.query
    );

    return sendPaginated(
      res,
      orders,
      total,
      page,
      limit,
      `Pesanan diambil dari ${marketplace}`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/:marketplace/orders/:id
 * Get a specific order by ID (must belong to the authenticated user).
 */
export const getOrder = (req, res, next) => {
  try {
    const { marketplace, id } = req.params;

    const order = orderService.getOrderById(marketplace, req.user.id, id);

    return sendSuccess(res, { order }, `Pesanan diambil dari${marketplace}`);
  } catch (err) {
    next(err);
  }
};
