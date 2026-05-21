// Marketplace Identifiers
export const MARKETPLACES = {
  SHOPEE: 'shopee',
  TOKOPEDIA: 'tokopedia',
  LAZADA: 'lazada',
};

// Mapping
export const FIELD_MAP = {
  shopee: {
    productId: 'item_id',
    sku: 'model_sku',
    skuPrefix: 'SHP',
    name: 'item_name',
    price: 'price',
    stock: 'stock',
    description: 'description',
    category: 'category',
    images: 'images',
    rating: 'item_rating',
    sold: 'historical_sold',
    shop: 'shopid',
  },
  tokopedia: {
    productId: 'product_id',
    sku: 'sku',
    skuPrefix: 'TOK',
    name: 'name',
    price: 'price',
    stock: 'stock',
    description: 'description',
    category: 'category',
    images: 'images',
    rating: 'rating',
    sold: 'sold',
    shop: 'shop_id',
  },
  lazada: {
    productId: 'id',
    sku: 'seller_sku',
    skuPrefix: 'LZD',
    name: 'name',
    price: 'price',
    stock: 'available',
    description: 'description',
    category: 'primary_category',
    images: 'images',
    rating: 'rating_score',
    sold: 'sold_count',
    shop: 'seller_id',
  },
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const ERROR_MODES = {
  NONE: 'none',
  RATE_LIMIT: 'rate_limit',
  TIMEOUT: 'timeout',
  SERVER_ERROR: 'server_error',
  AUTH_FAILURE: 'auth_failure',
};

export const WEBHOOK_EVENTS = {
  ORDER_CREATED: 'order.created',
  STOCK_UPDATED: 'stock.updated',
  TEST: 'webhook.test',
};
