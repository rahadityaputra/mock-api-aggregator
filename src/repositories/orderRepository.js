import { prisma } from '../prisma/client.js';

export const createOrderRecord = (data, db = prisma) => db.order.create({ data });

export const createOrderItemRecord = (data, db = prisma) => db.orderItem.create({ data });

export const findOrderById = (id, db = prisma) =>
  db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
  });

export const listOrdersByUser = (userId, marketplace, db = prisma) =>
  db.order.findMany({
    where: {
      user_id: userId,
      ...(marketplace ? { marketplace } : {}),
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

export const countOrdersByMarketplace = (marketplace, db = prisma) =>
  db.order.count({ where: { marketplace } });