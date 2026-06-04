import { prisma } from '../prisma/client.js';

export const findUserByEmail = (email, db = prisma) =>
  db.user.findUnique({ where: { email } });

export const findUserById = (id, db = prisma) =>
  db.user.findUnique({ where: { id } });

export const createUser = (data, db = prisma) =>
  db.user.create({ data });