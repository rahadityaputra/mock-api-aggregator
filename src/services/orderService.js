import { prisma } from '../prisma/client.js';
import { badRequest, notFound } from '../utils/errors.js';
import { countOrdersByMarketplace, findOrderById, listOrdersByUser } from '../repositories/orderRepository.js';
import { findProductByMarketplaceSku } from '../repositories/productRepository.js';
import { ORDER_STATUS, ERROR_TYPES } from '../config/constants.js';
import { generateOrderCode, normalizeMarketplace, serializeOrder } from '../utils/marketplace.js';
import { sendOrderWebhook } from './webhookService.js';
import { getSimulationStore } from './simulationService.js';

export const createOrder = async ({ marketplace, userId, marketplace_sku, quantity }) => {
  const normalized = normalizeMarketplace(marketplace);
  const simulationStore = getSimulationStore();
  const simulation = simulationStore.get(normalized);

  if (simulation?.type === ERROR_TYPES.STOCK_FAILED) {
    simulationStore.delete(normalized);
    throw badRequest('Stock failure simulation triggered');
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw badRequest('Quantity must be a positive integer');
  }

  const product = await findProductByMarketplaceSku(normalized, marketplace_sku);

  if (!product || product.status !== 'ACTIVE') {
    throw notFound('Product not found for this marketplace SKU');
  }

  if (product.stock < quantity) {
    throw badRequest('Insufficient stock');
  }

  const order = await prisma.$transaction(async (tx) => {
    const orderCount = await countOrdersByMarketplace(normalized, tx);
    const orderCode = generateOrderCode(normalized, orderCount + 1);
    const totalPrice = product.price * quantity;

    const createdOrder = await tx.order.create({
      data: {
        marketplace: normalized,
        order_code: orderCode,
        user_id: userId,
        status: ORDER_STATUS.CONFIRMED,
        total_price: totalPrice,
        items: {
          create: [
            {
              product_id: product.id,
              quantity,
              price: product.price,
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await tx.product.update({
      where: { id: product.id },
      data: {
        stock: product.stock - quantity,
      },
    });

    return createdOrder;
  });

  const createdItem = order.items[0];

  const webhookResult = await sendOrderWebhook(order, createdItem, createdItem.product);

  return {
    order: serializeOrder(order),
    webhook: webhookResult,
  };
};

export const getMyOrders = async (userId, marketplace) => {
  const normalized = marketplace ? normalizeMarketplace(marketplace) : null;
  const orders = await listOrdersByUser(userId, normalized);

  return orders.map(serializeOrder);
};

export const getOrderById = async (userId, orderId, marketplace) => {
  const normalized = normalizeMarketplace(marketplace);
  const order = await findOrderById(orderId);

  if (!order || order.user_id !== userId || order.marketplace !== normalized) {
    throw notFound('Order not found');
  }

  return serializeOrder(order);
};