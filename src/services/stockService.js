import { productStores, getSkuField, getStockField } from '../models/Product.js';
import { MARKETPLACES } from '../config/constants.js';

/**
 * Update the stock level for a single product SKU in a marketplace.
 *
 * @param {string} marketplace
 * @param {string} sku         - Marketplace-native SKU string
 * @param {number} newStock    - New stock quantity (must be >= 0)
 * @returns {object} Updated product record
 * @throws {Error} 404 if SKU not found, 400 if invalid stock value
 */
export const updateSingleStock = (marketplace, sku, newStock) => {
  if (!Object.values(MARKETPLACES).includes(marketplace)) {
    const err = new Error(`Marketplace tidak didukung: ${marketplace}`);
    err.status = 400;
    throw err;
  }

  if (typeof newStock !== 'number' || newStock < 0 || !Number.isFinite(newStock)) {
    const err = new Error('Stock harus valid.');
    err.status = 400;
    throw err;
  }

  const store = productStores[marketplace];
  const skuField = getSkuField(marketplace);
  const stockField = getStockField(marketplace);

  const product = store.find((p) => p[skuField] === sku);

  if (!product) {
    const err = new Error(`SKU "${sku}" tidak ditemukan di ${marketplace}`);
    err.status = 404;
    throw err;
  }

  const previousStock = product[stockField];
  product[stockField] = Math.floor(newStock); 
  product.updatedAt = new Date().toISOString();

  console.log(
    `[STOCK] ${marketplace} | SKU: ${sku} | ${previousStock} → ${product[stockField]}`
  );

  return product;
};

/**
 * Bulk update stock levels for multiple SKUs in a marketplace.
 * Partial success is allowed — each item reports its own result.
 *
 * @param {string} marketplace
 * @param {Array<{ sku: string, stock: number }>} updates
 * @returns {{ results: Array<object>, successCount: number, failureCount: number }}
 */
export const bulkUpdateStock = (marketplace, updates) => {
  if (!Object.values(MARKETPLACES).includes(marketplace)) {
    const err = new Error(`Marketplace tidak didukung: ${marketplace}`);
    err.status = 400;
    throw err;
  }

  if (!Array.isArray(updates) || updates.length === 0) {
    const err = new Error('Updates tidak valid.');
    err.status = 400;
    throw err;
  }

  if (updates.length > 100) {
    const err = new Error('Update dibatasi hanya 100 SKU per request.');
    err.status = 400;
    throw err;
  }

  const results = [];
  let successCount = 0;
  let failureCount = 0;

  for (const { sku, stock } of updates) {
    try {
      if (!sku) throw new Error('SKU wajib diisi!');
      const updatedProduct = updateSingleStock(marketplace, sku, stock);
      results.push({ sku, success: true, newStock: stock, product: updatedProduct });
      successCount++;
    } catch (err) {
      results.push({ sku, success: false, error: err.message });
      failureCount++;
    }
  }

  return { results, successCount, failureCount };
};

/**
 * Get the current stock level for a product by SKU.
 *
 * @param {string} marketplace
 * @param {string} sku
 * @returns {{ sku: string, stock: number, product: object }}
 * @throws {Error} 404 if not found
 */
export const getStockBySku = (marketplace, sku) => {
  const store = productStores[marketplace];
  const skuField = getSkuField(marketplace);
  const stockField = getStockField(marketplace);

  const product = store.find((p) => p[skuField] === sku);

  if (!product) {
    const err = new Error(`SKU "${sku}" tidak ditemukan di ${marketplace}`);
    err.status = 404;
    throw err;
  }

  return { sku, stock: product[stockField], product };
};
