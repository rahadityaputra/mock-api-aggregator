import { prisma } from '../prisma/client.js';

const productInclude = {
  images: {
    orderBy: { createdAt: 'asc' },
  },
};

const buildWhere = (marketplace, filters = {}) => ({
  marketplace,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.category ? { category: filters.category } : {}),
  ...(filters.search
    ? {
        OR: [
          { product_name: { contains: filters.search } },
          { marketplace_sku: { contains: filters.search } },
          { internal_sku: { contains: filters.search } },
          { description: { contains: filters.search } },
          { brand: { contains: filters.search } },
          { category: { contains: filters.search } },
        ],
      }
    : {}),
  ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
    ? {
        price: {
          ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
          ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
        },
      }
    : {}),
});

export const createProductRecord = (data, db = prisma) => {
  const { images = [], ...productData } = data;

  return db.product.create({
    data: {
      ...productData,
      images: {
        create: images.map((image_url) => ({ image_url })),
      },
    },
    include: productInclude,
  });
};

export const findProductById = (id, db = prisma) =>
  db.product.findUnique({ where: { id }, include: productInclude });

export const findProductByMarketplaceSku = (marketplace, marketplace_sku, db = prisma) =>
  db.product.findUnique({
    where: {
      marketplace_marketplace_sku: {
        marketplace,
        marketplace_sku,
      },
    },
    include: productInclude,
  });

export const findProductByInternalSku = (marketplace, internal_sku, db = prisma) =>
  db.product.findUnique({
    where: {
      marketplace_internal_sku: {
        marketplace,
        internal_sku,
      },
    },
    include: productInclude,
  });

export const listMarketplaceProducts = (marketplace, filters = {}, db = prisma) =>
  db.product.findMany({
    where: buildWhere(marketplace, filters),
    orderBy: { createdAt: 'desc' },
    skip: filters.skip,
    take: filters.take,
    include: {
      images: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

export const countMarketplaceProducts = (marketplace, filters = {}, db = prisma) =>
  db.product.count({ where: buildWhere(marketplace, filters) });

export const updateProductRecord = (id, data, db = prisma) =>
  db.product.update({ where: { id }, data, include: productInclude });

export const replaceProductImages = async (id, imageUrls, db = prisma) => {
  await db.productImage.deleteMany({ where: { product_id: id } });

  if (!imageUrls || imageUrls.length === 0) {
    return [];
  }

  await db.productImage.createMany({
    data: imageUrls.map((image_url) => ({ product_id: id, image_url })),
  });

  return db.productImage.findMany({ where: { product_id: id }, orderBy: { createdAt: 'asc' } });
};

export const archiveProductRecord = (id, db = prisma) =>
  db.product.update({
    where: { id },
    data: { status: 'ARCHIVED' },
    include: productInclude,
  });

export const deleteProductRecord = (id, db = prisma) =>
  db.product.delete({ where: { id } });