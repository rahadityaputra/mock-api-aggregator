import { prisma } from '../prisma/client.js';

export const createWebhookLog = (data, db = prisma) => db.webhookLog.create({ data });

export const listWebhookLogs = (marketplace, db = prisma) =>
  db.webhookLog.findMany({
    where: { marketplace },
    orderBy: { createdAt: 'desc' },
  });