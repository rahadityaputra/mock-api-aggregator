/**
 * Order.js
 * In-memory order store and Order model factory.
 */

import { v4 as uuidv4 } from 'uuid';

// ─── In-Memory Store ──────────────────────────────────────────────────────────

export const orders = [];

// ─── Order Status Constants ───────────────────────────────────────────────────

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// ─── Model Factory ────────────────────────────────────────────────────────────

/**
 * Creates a new order record ready for storage.
 *
 * @param {object} params
 * @param {string} params.marketplace     - 'shopee' | 'tokopedia' | 'lazada'
 * @param {string} params.userId          - ID of the authenticated user
 * @param {string} params.productId       - Marketplace-native product ID
 * @param {string} params.sku             - Marketplace-native SKU string
 * @param {string} params.productName     - Human-readable product name
 * @param {number} params.quantity        - Units ordered
 * @param {number} params.unitPrice       - Price per unit at time of order
 * @param {object} [params.shippingAddress] - Optional shipping address object
 * @returns {object} Order record
 */
export const createOrder = ({
  marketplace,
  userId,
  productId,
  sku,
  productName,
  quantity,
  unitPrice,
  shippingAddress = {},
}) => {
  const orderId = uuidv4();
  const now = new Date().toISOString();
  const totalPrice = unitPrice * quantity;

  // Each marketplace wraps the order in slightly different envelope structures
  const marketplaceOrderId = generateMarketplaceOrderId(marketplace);

  return {
    id: orderId,
    marketplace_order_id: marketplaceOrderId,
    marketplace,
    userId,
    productId,
    sku,
    productName,
    quantity,
    unitPrice,
    totalPrice,
    currency: 'IDR',
    status: ORDER_STATUS.CONFIRMED,
    shippingAddress,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Generates a human-readable marketplace-style order ID.
 * @param {string} marketplace
 * @returns {string}
 */
const generateMarketplaceOrderId = (marketplace) => {
  const prefixes = { shopee: 'SHP', tokopedia: 'TOK', lazada: 'LZD' };
  const prefix = prefixes[marketplace] || 'MKT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-ORD-${timestamp}-${random}`;
};
