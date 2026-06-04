import { AppError, badRequest } from './errors.js';
import {
  ERROR_TYPES,
  MARKETPLACES,
  MARKETPLACE_LABELS,
  MARKETPLACE_META,
  PRODUCT_STATUSES,
} from '../config/constants.js';

export const supportedMarketplaces = MARKETPLACES;

export const normalizeMarketplace = (value) => {
  const marketplace = String(value || '').toLowerCase();

  if (!MARKETPLACES.includes(marketplace)) {
    throw new AppError(400, `Invalid marketplace: ${value}`);
  }

  return marketplace;
};

export const getMarketplaceMeta = (marketplace) => {
  const normalized = normalizeMarketplace(marketplace);
  return MARKETPLACE_META[normalized];
};

const normalizeStringArray = (value) => {
  if (value === undefined || value === null || value === '') {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStringArray(item));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.flatMap((item) => normalizeStringArray(item));
      }
    } catch {
      // Treat as raw string path.
    }

    return [value.trim()].filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
};

const normalizeStatus = (value) => {
  const status = String(value || 'ACTIVE').toUpperCase();

  if (!PRODUCT_STATUSES.includes(status)) {
    throw badRequest(`Invalid product status. Allowed values: ${PRODUCT_STATUSES.join(', ')}`);
  }

  return status;
};

const normalizeWeight = (value) => {
  const weight = Number(value);

  if (!Number.isFinite(weight) || weight <= 0) {
    throw badRequest('weight must be a positive number');
  }

  return weight;
};

const normalizeRequiredInteger = (value, fieldName) => {
  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw badRequest(`${fieldName} must be a non-negative integer`);
  }

  return numberValue;
};

const buildImageList = (bodyImages) => {
  const imageUrls = normalizeStringArray(bodyImages);

  if (imageUrls.length === 0) {
    throw badRequest('At least one product image is required');
  }

  if (imageUrls.length > 5) {
    throw badRequest('A product can only have up to 5 images');
  }

  return [...new Set(imageUrls)];
};

export const serializeProduct = (product) => {
  const marketplace = normalizeMarketplace(product.marketplace);

  return {
    id: product.id,
    marketplace,
    product_name: product.product_name,
    marketplace_sku: product.marketplace_sku,
    internal_sku: product.internal_sku,
    description: product.description,
    category: product.category,
    brand: product.brand,
    price: product.price,
    stock: product.stock,
    weight: product.weight,
    thumbnail_url: product.thumbnail_url,
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    images: (product.images || []).map((image) => image.image_url || image),
  };
};

export const serializeOrder = (order) => {
  const marketplace = normalizeMarketplace(order.marketplace);
  const meta = getMarketplaceMeta(marketplace);

  return {
    id: order.id,
    marketplace,
    order_code: order.order_code,
    status: order.status,
    total_price: order.total_price,
    createdAt: order.createdAt,
    items: (order.items || []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      price: item.price,
      product: item.product ? serializeProduct(item.product) : null,
      marketplace_sku: item.product?.marketplace_sku,
    })),
  };
};

export const generateOrderCode = (marketplace, sequenceNumber) => {
  const meta = getMarketplaceMeta(marketplace);
  return `${meta.code}${String(sequenceNumber).padStart(3, '0')}`;
};

export const buildProductCreateData = (marketplace, body) => {
  normalizeMarketplace(marketplace);
  const productName = body.product_name?.trim();
  const marketplaceSku = body.marketplace_sku?.trim();
  const internalSku = body.internal_sku?.trim();
  const description = body.description?.trim() || null;
  const category = body.category?.trim();
  const brand = body.brand?.trim() || null;
  const price = normalizeRequiredInteger(body.price, 'price');
  const stock = normalizeRequiredInteger(body.stock, 'stock');
  const weight = normalizeWeight(body.weight);
  const status = normalizeStatus(body.status);
  const images = buildImageList(body.images);

  if (!productName || !marketplaceSku || !internalSku || !category) {
    throw badRequest('product_name, marketplace_sku, internal_sku, and category are required');
  }

  return {
    marketplace: normalizeMarketplace(marketplace),
    product_name: productName,
    marketplace_sku: marketplaceSku,
    internal_sku: internalSku,
    description,
    category,
    brand,
    price,
    stock,
    weight,
    thumbnail_url: body.thumbnail_url?.trim() || images[0],
    status,
    images,
  };
};

export const buildProductUpdateData = (marketplace, body) => {
  const data = {};

  normalizeMarketplace(marketplace);

  if (body.product_name !== undefined) {
    data.product_name = String(body.product_name).trim();
  }

  if (body.description !== undefined) {
    data.description = body.description === null ? null : String(body.description).trim();
  }

  if (body.category !== undefined) {
    data.category = String(body.category).trim();
  }

  if (body.brand !== undefined) {
    data.brand = body.brand === null ? null : String(body.brand).trim();
  }

  if (body.price !== undefined) {
    data.price = normalizeRequiredInteger(body.price, 'price');
  }

  if (body.stock !== undefined) {
    data.stock = normalizeRequiredInteger(body.stock, 'stock');
  }

  if (body.weight !== undefined) {
    data.weight = normalizeWeight(body.weight);
  }

  if (body.thumbnail_url !== undefined) {
    data.thumbnail_url = body.thumbnail_url ? String(body.thumbnail_url).trim() : null;
  }

  if (body.status !== undefined) {
    data.status = normalizeStatus(body.status);
  }

  if (body.images !== undefined) {
    data.images = buildImageList(body.images);
  }

  if (Object.keys(data).length === 0) {
    throw badRequest(`No updateable fields provided for ${marketplace}`);
  }

  return data;
};

export const buildStockUpdateData = (marketplace, body) => {
  normalizeMarketplace(marketplace);
  const value = body.stock;

  if (value === undefined) {
    throw badRequest('Expected stock in request body');
  }

  return {
    stock: normalizeRequiredInteger(value, 'stock'),
  };
};

export const buildOrderRequestData = (marketplace, body) => {
  const meta = getMarketplaceMeta(marketplace);
  const sku = body[meta.orderPayloadSkuKey];
  const quantity = body[meta.orderQtyKey];

  if (!sku || quantity === undefined) {
    throw badRequest(`Invalid ${marketplace} order payload`);
  }

  return {
    marketplace,
    marketplace_sku: sku,
    quantity: Number(quantity),
  };
};

export const buildWebhookPayload = (order, item, product) => {
  const marketplace = normalizeMarketplace(order.marketplace);
  const label = MARKETPLACE_LABELS[marketplace];

  if (marketplace === 'tokopedia') {
    return {
      fs_id: 123456,
      shop_id: 9876543,
      invoice_num: order.order_code,
      order_status: 220,
      payment_id: 98765,
      products: [
        {
          sku: product.marketplace_sku,
          price: product.price,
          quantity: item.quantity,
        },
      ],
    };
  }

  if (marketplace === 'shopee') {
    return {
      shop_id: 123456,
      code: 3,
      timestamp: Math.floor(Date.now() / 1000),
      data: {
        ordersn: order.order_code,
        status: 'UNPAID',
        update_time: Math.floor(Date.now() / 1000),
        sku: product.marketplace_sku, // Kept to avoid breaking adapter
        qty: item.quantity, // Kept to avoid breaking adapter
      },
    };
  }

  if (marketplace === 'lazada') {
    return {
      message_type: 0,
      site_id: 'ID',
      seller_id: '100123456',
      timestamp: Math.floor(Date.now() / 1000),
      data: {
        trade_order_id: order.order_code,
        order_status: 'pending',
        buyer_id: 554433,
        trade_order_lines: [
          {
            order_item_id: 987654321,
            sku: product.marketplace_sku,
            quantity: item.quantity,
          },
        ],
      },
    };
  }

  // Fallback (should not be reached if validation is correct)
  return {
    event: 'ORDER_CREATED',
    marketplace: label,
    order_id: order.order_code,
    marketplace_sku: product.marketplace_sku,
    qty: item.quantity,
  };
};

export const buildWebhookReceiverPayload = (marketplace, body) => {
  const normalized = normalizeMarketplace(marketplace);

  if (normalized === 'tokopedia') {
    if (!body.invoice_num || !body.products || !body.products[0].sku) {
      throw badRequest(`Invalid webhook payload for ${normalized}`);
    }
    return {
      marketplace: normalized,
      event_type: 'ORDER_CREATED',
      payload: body,
      status: 'RECEIVED',
    };
  }

  if (normalized === 'shopee') {
    if (!body.data || !body.data.ordersn || !body.data.sku) {
      throw badRequest(`Invalid webhook payload for ${normalized}`);
    }
    return {
      marketplace: normalized,
      event_type: 'ORDER_CREATED',
      payload: body,
      status: 'RECEIVED',
    };
  }

  if (normalized === 'lazada') {
    if (!body.data || !body.data.trade_order_id || !body.data.trade_order_lines || !body.data.trade_order_lines[0].sku) {
      throw badRequest(`Invalid webhook payload for ${normalized}`);
    }
    return {
      marketplace: normalized,
      event_type: 'ORDER_CREATED',
      payload: body,
      status: 'RECEIVED',
    };
  }

  throw badRequest(`Invalid marketplace label for ${normalized}`);
};

export const consumeSimulationError = (marketplace, simulationState) => {
  const normalized = normalizeMarketplace(marketplace);
  const pending = simulationState.get(normalized);

  if (!pending) {
    return null;
  }

  simulationState.delete(normalized);
  return pending;
};