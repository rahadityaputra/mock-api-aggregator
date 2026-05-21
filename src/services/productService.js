/**
 * productService.js
 * Business logic for product listing and detail retrieval per marketplace.
 */

import {
  productStores,
  getProductIdField,
  getSkuField,
} from '../models/Product.js';
import { MARKETPLACES } from '../config/constants.js';

/**
 * Validates that the marketplace identifier is one of the supported platforms.
 * @param {string} marketplace
 * @throws {Error} 400 if marketplace is invalid
 */
const validateMarketplace = (marketplace) => {
  if (!Object.values(MARKETPLACES).includes(marketplace)) {
    const err = new Error(
      `Invalid marketplace "${marketplace}". Valid options: shopee, tokopedia, lazada`
    );
    err.status = 400;
    throw err;
  }
};

/**
 * List all products for a given marketplace with optional filtering and pagination.
 *
 * @param {string} marketplace
 * @param {object} queryParams - { page, limit, category, search, minPrice, maxPrice }
 * @returns {{ products: Array, total: number, page: number, limit: number }}
 */
export const listProducts = (marketplace, queryParams = {}) => {
  validateMarketplace(marketplace);

  const store = productStores[marketplace];
  const {
    page = 1,
    limit = 20,
    category,
    search,
    minPrice,
    maxPrice,
  } = queryParams;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

  // Determine price and name fields dynamically per marketplace
  const nameField = marketplace === 'shopee' ? 'item_name' : 'name';
  const priceField = 'price';
  const categoryField = marketplace === 'lazada' ? 'primary_category' : 'category';

  let filtered = [...store];

  // Filter by category
  if (category) {
    filtered = filtered.filter(
      (p) => p[categoryField]?.toLowerCase() === category.toLowerCase()
    );
  }

  // Filter by search term (matches name or SKU)
  if (search) {
    const skuField = getSkuField(marketplace);
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p[nameField]?.toLowerCase().includes(term) ||
        p[skuField]?.toLowerCase().includes(term)
    );
  }

  // Filter by price range
  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p[priceField] >= Number(minPrice));
  }
  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p[priceField] <= Number(maxPrice));
  }

  const total = filtered.length;
  const start = (pageNum - 1) * limitNum;
  const products = filtered.slice(start, start + limitNum);

  return { products, total, page: pageNum, limit: limitNum };
};

/**
 * Get a single product by its marketplace-native ID.
 *
 * @param {string} marketplace
 * @param {string} productId - The value of item_id / product_id / id
 * @returns {object} Product record
 * @throws {Error} 404 if not found
 */
export const getProductById = (marketplace, productId) => {
  validateMarketplace(marketplace);

  const store = productStores[marketplace];
  const idField = getProductIdField(marketplace);

  const product = store.find((p) => p[idField] === productId);

  if (!product) {
    const err = new Error(`Product with ID "${productId}" not found in ${marketplace}`);
    err.status = 404;
    throw err;
  }

  return product;
};

/**
 * Get a single product by its marketplace-native SKU.
 *
 * @param {string} marketplace
 * @param {string} sku
 * @returns {object|null} Product record or null
 */
export const getProductBySku = (marketplace, sku) => {
  const store = productStores[marketplace];
  const skuField = getSkuField(marketplace);
  return store.find((p) => p[skuField] === sku) || null;
};
