export const MARKETPLACES = ['shopee', 'tokopedia', 'lazada'];

export const MARKETPLACE_LABELS = {
  shopee: 'Shopee',
  tokopedia: 'Tokopedia',
  lazada: 'Lazada',
};

export const PRODUCT_STATUSES = ['ACTIVE', 'DRAFT', 'ARCHIVED'];

export const PRODUCT_IMAGE_RULES = {
  maxCount: 5,
  maxSizeBytes: 5 * 1024 * 1024,
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};

export const MARKETPLACE_META = {
  shopee: {
    code: 'SP',
    productNameKey: 'item_name',
    skuKey: 'model_sku',
    stockKey: 'stock',
    orderQtyKey: 'qty',
    orderPayloadSkuKey: 'model_sku',
  },
  tokopedia: {
    code: 'TK',
    productNameKey: 'name',
    skuKey: 'sku',
    stockKey: 'stock',
    orderQtyKey: 'quantity',
    orderPayloadSkuKey: 'sku',
  },
  lazada: {
    code: 'LZ',
    productNameKey: 'title',
    skuKey: 'seller_sku',
    stockKey: 'quantity',
    orderQtyKey: 'quantity',
    orderPayloadSkuKey: 'seller_sku',
  },
};


export const ERROR_TYPES = {
  STOCK_FAILED: 'STOCK_FAILED',
  WEBHOOK_FAILED: 'WEBHOOK_FAILED',
  TIMEOUT: 'TIMEOUT',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  FAILED: 'FAILED',
};

export const DEFAULT_WEBHOOK_BASE_URL = process.env.WEBHOOK_BASE_URL || 'http://localhost:3000/api/v1/webhooks';