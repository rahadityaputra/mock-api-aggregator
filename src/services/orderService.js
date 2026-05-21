/**
 * orderService.js
 * Business logic for order creation and retrieval.
 * Orchestrates stock validation, order persistence, stock reduction, and webhook firing.
 */

import { orders, createOrder } from '../models/Order.js';
import { productStores, getProductIdField, getSkuField, getStockField } from '../models/Product.js';
import { triggerOrderWebhook } from './webhookService.js';
import { MARKETPLACES } from '../config/constants.js';

/**
 * Create a new order for a marketplace product.
 *
 * Flow:
 *  1. Validate marketplace
 *  2. Locate the product by its native ID
 *  3. Check sufficient stock
 *  4. Persist the order
 *  5. Decrement stock in the product store
 *  6. Fire webhook (non-blocking)
 *
 * @param {string} marketplace
 * @param {string} userId
 * @param {object} body - { productId, quantity, shippingAddress }
 * @returns {object} Created order record
 */
export const placeOrder = (marketplace, userId, body) => {
  if (!Object.values(MARKETPLACES).includes(marketplace)) {
    const err = new Error(`Invalid marketplace: ${marketplace}`);
    err.status = 400;
    throw err;
  }

  const { productId, quantity, shippingAddress = {} } = body;

  // ── Validate inputs ────────────────────────────────────────────────────────
  if (!productId) {
    const err = new Error('productId is required');
    err.status = 400;
    throw err;
  }

  const qty = parseInt(quantity, 10);
  if (!quantity || qty < 1 || isNaN(qty)) {
    const err = new Error('quantity must be a positive integer');
    err.status = 400;
    throw err;
  }

  // ── Locate product ─────────────────────────────────────────────────────────
  const store = productStores[marketplace];
  const idField = getProductIdField(marketplace);
  const skuField = getSkuField(marketplace);
  const stockField = getStockField(marketplace);

  const product = store.find((p) => p[idField] === productId);
  if (!product) {
    const err = new Error(`Product "${productId}" not found in ${marketplace}`);
    err.status = 404;
    throw err;
  }

  // ── Check stock ────────────────────────────────────────────────────────────
  const currentStock = product[stockField];
  if (currentStock < qty) {
    const err = new Error(
      `Insufficient stock. Requested: ${qty}, Available: ${currentStock}`
    );
    err.status = 422;
    throw err;
  }

  // ── Extract name field dynamically ─────────────────────────────────────────
  const productName = product.item_name || product.name;

  // ── Build and persist order ────────────────────────────────────────────────
  const order = createOrder({
    marketplace,
    userId,
    productId,
    sku: product[skuField],
    productName,
    quantity: qty,
    unitPrice: product.price,
    shippingAddress,
  });

  orders.push(order);

  // ── Reduce stock ───────────────────────────────────────────────────────────
  product[stockField] -= qty;
  product.updatedAt = new Date().toISOString();

  console.log(
    `[ORDER] Created: ${order.marketplace_order_id} | ${marketplace} | qty:${qty} | stock:${currentStock}→${product[stockField]}`
  );

  // ── Trigger webhook (fire & forget) ───────────────────────────────────────
  triggerOrderWebhook(marketplace, order);

  return order;
};

/**
 * List all orders for a specific user in a marketplace.
 *
 * @param {string} marketplace
 * @param {string} userId
 * @param {object} queryParams - { page, limit, status }
 * @returns {{ orders: Array, total: number, page: number, limit: number }}
 */
export const getUserOrders = (marketplace, userId, queryParams = {}) => {
  const { page = 1, limit = 20, status } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  let filtered = orders.filter(
    (o) => o.marketplace === marketplace && o.userId === userId
  );

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  // Most recent first
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const paged = filtered.slice(start, start + limitNum);

  return { orders: paged, total, page: pageNum, limit: limitNum };
};

/**
 * Get a specific order by its ID, scoped to marketplace and user.
 *
 * @param {string} marketplace
 * @param {string} userId
 * @param {string} orderId
 * @returns {object} Order record
 * @throws {Error} 404 if not found or not owned by user
 */
export const getOrderById = (marketplace, userId, orderId) => {
  const order = orders.find(
    (o) => o.id === orderId && o.marketplace === marketplace && o.userId === userId
  );

  if (!order) {
    const err = new Error(`Order "${orderId}" not found`);
    err.status = 404;
    throw err;
  }

  return order;
};
