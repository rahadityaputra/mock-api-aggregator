import { prisma } from '../prisma/client.js';
import { notFound, badRequest } from '../utils/errors.js';
import {
  archiveProductRecord,
  createProductRecord,
  findProductById,
  findProductByInternalSku,
  findProductByMarketplaceSku,
  listMarketplaceProducts,
  replaceProductImages,
  updateProductRecord,
  countMarketplaceProducts,
} from '../repositories/productRepository.js';
import { serializeProduct, normalizeMarketplace } from '../utils/marketplace.js';

const buildPagination = (page, limit) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const listProducts = async (marketplace, query = {}) => {
  const normalized = normalizeMarketplace(marketplace);
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  const filters = {
    ...buildPagination(page, limit),
    search: query.search || undefined,
    category: query.category || undefined,
    status: query.status ? String(query.status).toUpperCase() : 'ACTIVE',
    minPrice: query.minPrice !== undefined ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
  };

  const [items, total] = await Promise.all([
    listMarketplaceProducts(normalized, filters),
    countMarketplaceProducts(normalized, filters),
  ]);

  return {
    items: items.map(serializeProduct),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProduct = async (marketplace, productId) => {
  const normalized = normalizeMarketplace(marketplace);
  const product = await findProductById(productId);

  if (!product || product.marketplace !== normalized) {
    throw notFound('Product not found');
  }

  return serializeProduct(product);
};

export const createProduct = async (productData) => {
  const [existingMarketplaceSku, existingInternalSku] = await Promise.all([
    findProductByMarketplaceSku(productData.marketplace, productData.marketplace_sku),
    findProductByInternalSku(productData.marketplace, productData.internal_sku),
  ]);

  if (existingMarketplaceSku) {
    throw badRequest('marketplace_sku already exists for this marketplace');
  }

  if (existingInternalSku) {
    throw badRequest('internal_sku already exists for this marketplace');
  }

  const product = await createProductRecord(productData);
  return serializeProduct(product);
};

export const updateProduct = async (marketplace, productId, updateData) => {
  const normalized = normalizeMarketplace(marketplace);
  const product = await findProductById(productId);

  if (!product || product.marketplace !== normalized) {
    throw notFound('Product not found');
  }

  const { images, ...productFields } = updateData;

  const updated = await prisma.$transaction(async (tx) => {
    if (Object.keys(productFields).length > 0) {
      await updateProductRecord(productId, productFields, tx);
    }

    if (images !== undefined) {
      await replaceProductImages(productId, images, tx);
    }

    return findProductById(productId, tx);
  });

  return serializeProduct(updated);
};

export const deleteProduct = async (marketplace, productId) => {
  const normalized = normalizeMarketplace(marketplace);
  const product = await findProductById(productId);

  if (!product || product.marketplace !== normalized) {
    throw notFound('Product not found');
  }

  const archived = await archiveProductRecord(productId);
  return serializeProduct(archived);
};

export const updateProductStock = async (marketplace, productId, stockData) => {
  const normalized = normalizeMarketplace(marketplace);
  const product = await findProductById(productId);

  if (!product || product.marketplace !== normalized) {
    throw notFound('Product not found');
  }

  const updated = await updateProductRecord(productId, { stock: stockData.stock });

  return serializeProduct(updated);
};