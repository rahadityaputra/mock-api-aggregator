# 🛒 Mock Marketplace API

A production-ready mock backend API that simulates **Shopee**, **Tokopedia**, and **Lazada** e-commerce marketplace APIs. Built with Express.js using in-memory storage — no database required.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# Copy the example env and edit as needed
copy .env .env.local
```

Default `.env` values work out of the box for local development.

### 3. Start the server

```bash
# Development (with file-watch auto-restart)
npm run dev

# Production
npm start
```

The API starts at: **`http://localhost:4000/api`**

---

## 🔑 Pre-seeded Test Account

| Field    | Value            |
|----------|------------------|
| Email    | `test@example.com` |
| Password | `password123`    |
| Username | `testuser`       |

Use the login endpoint to get a JWT, then pass it as `Authorization: Bearer <token>` on protected routes.

---

## 🏪 Marketplace Field Differences

Each marketplace uses different field names — this is intentional:

| Concept      | Shopee         | Tokopedia     | Lazada        |
|--------------|----------------|---------------|---------------|
| Product ID   | `item_id`      | `product_id`  | `id`          |
| SKU          | `model_sku`    | `sku`         | `seller_sku`  |
| Product Name | `item_name`    | `name`        | `name`        |
| Stock        | `stock`        | `stock`       | `available`   |
| Category     | `category`     | `category`    | `primary_category` |
| Rating       | `item_rating`  | `rating`      | `rating_score`|
| SKU Prefix   | `SHP-*`        | `TOK-*`       | `LZD-*`       |

---

## 📋 API Reference

### Base URL
```
http://localhost:4000/api
```

---

### 🩺 Health Check

#### `GET /health`
```bash
curl http://localhost:4000/health
```

---

### 🔐 Authentication

#### `POST /api/auth/register`
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","username":"myuser","password":"securepass","name":"My Name"}'
```

#### `POST /api/auth/login`
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "test@example.com", "username": "testuser" },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

#### `GET /api/auth/me`
```bash
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 📦 Products

#### `GET /api/:marketplace/products`
List products with optional filters.

```bash
# Shopee products
curl "http://localhost:4000/api/shopee/products"

# With filters
curl "http://localhost:4000/api/tokopedia/products?category=Electronics&page=1&limit=5"
curl "http://localhost:4000/api/lazada/products?search=earbuds&minPrice=100000&maxPrice=500000"
```

Query Parameters:
| Param      | Type   | Description                         |
|------------|--------|-------------------------------------|
| `page`     | number | Page number (default: 1)            |
| `limit`    | number | Items per page (default: 20, max: 100) |
| `category` | string | Filter by category (exact match)    |
| `search`   | string | Search in product name and SKU      |
| `minPrice` | number | Minimum price filter                |
| `maxPrice` | number | Maximum price filter                |

#### `GET /api/:marketplace/products/:id`
Get a single product by its marketplace-native ID.

```bash
# Get the product ID from the list endpoint first
curl "http://localhost:4000/api/shopee/products/PRODUCT_ITEM_ID"
```

---

### 🛍️ Orders (Authentication Required)

#### `POST /api/:marketplace/orders`
Create an order. Validates stock, saves the order, decrements stock, and fires a webhook.

```bash
curl -X POST http://localhost:4000/api/shopee/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PRODUCT_ITEM_ID",
    "quantity": 2,
    "shippingAddress": {
      "name": "John Doe",
      "street": "Jl. Sudirman No. 1",
      "city": "Jakarta",
      "postalCode": "10220"
    }
  }'
```

#### `GET /api/:marketplace/orders`
List authenticated user's orders.

```bash
curl "http://localhost:4000/api/shopee/orders?page=1&limit=10&status=confirmed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### `GET /api/:marketplace/orders/:id`
Get a specific order by its UUID.

```bash
curl "http://localhost:4000/api/shopee/orders/ORDER_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 📊 Stock Management (Authentication Required)

#### `PUT /api/:marketplace/stock/:sku`
Update stock for a single SKU.

```bash
curl -X PUT http://localhost:4000/api/shopee/stock/SHP-ELEC-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock": 250}'
```

#### `PUT /api/:marketplace/stock/bulk`
Bulk update stock for multiple SKUs (max 100 per request). Partial success is supported.

```bash
curl -X PUT http://localhost:4000/api/tokopedia/stock/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"sku": "TOK-ELEC-001", "stock": 100},
      {"sku": "TOK-FOOD-003", "stock": 500},
      {"sku": "TOK-BOOK-005", "stock": 200}
    ]
  }'
```

---

### 🔔 Webhook System (Authentication Required)

#### `POST /api/:marketplace/webhook/config`
Configure the aggregator webhook URL.

```bash
curl -X POST http://localhost:4000/api/shopee/webhook/config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://your-aggregator.com/webhook",
    "secret": "my_webhook_secret",
    "events": ["order.created", "stock.updated"],
    "enabled": true
  }'
```

#### `POST /api/:marketplace/webhook/test`
Send a test webhook to verify the configured URL.

```bash
curl -X POST http://localhost:4000/api/shopee/webhook/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Webhook payload format** (sent on every order creation):
```json
{
  "event": "order.created",
  "marketplace": "shopee",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "order": {
      "id": "uuid",
      "marketplace_order_id": "SHP-ORD-12345678-4321",
      "marketplace": "shopee",
      "sku": "SHP-ELEC-001",
      "productName": "Wireless Bluetooth Earbuds Pro",
      "quantity": 2,
      "unitPrice": 299000,
      "totalPrice": 598000,
      "status": "confirmed"
    }
  }
}
```

---

### ⚙️ Marketplace Operations

#### `GET /api/:marketplace/status`
Get current status, product/order counts, and webhook config.

```bash
curl http://localhost:4000/api/shopee/status
```

#### `POST /api/:marketplace/reset`
Reset all marketplace data (stock, orders) to initial seed state.

```bash
curl -X POST http://localhost:4000/api/shopee/reset
```

#### `POST /api/:marketplace/simulate-error`
Simulate marketplace errors for testing aggregator resilience.

```bash
# Simulate rate limiting
curl -X POST http://localhost:4000/api/shopee/simulate-error \
  -H "Content-Type: application/json" \
  -d '{"mode": "rate_limit"}'

# Available modes:
# "none"         — Normal operation (default)
# "rate_limit"   — Returns 429 Too Many Requests
# "timeout"      — Returns 503 Service Unavailable
# "server_error" — Returns 500 Internal Server Error
# "auth_failure" — Returns 401 Unauthorized

# Disable error simulation
curl -X POST http://localhost:4000/api/shopee/simulate-error \
  -H "Content-Type: application/json" \
  -d '{"mode": "none"}'
```

---

## 📁 Project Structure

```
project-root/
├── src/
│   ├── config/
│   │   └── constants.js          # Marketplace configs, SKU formats, error modes
│   ├── controllers/
│   │   ├── authController.js     # HTTP handlers for auth endpoints
│   │   ├── productController.js  # HTTP handlers for product endpoints
│   │   ├── orderController.js    # HTTP handlers for order endpoints
│   │   └── stockController.js    # HTTP handlers for stock/webhook/ops
│   ├── routes/
│   │   ├── auth.js               # Auth route definitions
│   │   ├── marketplace.js        # Marketplace-scoped route definitions
│   │   └── index.js              # Root API router
│   ├── middleware/
│   │   ├── authentication.js     # JWT validation middleware
│   │   └── errorHandler.js       # Global error + 404 handlers
│   ├── models/
│   │   ├── User.js               # User store + factory + seed user
│   │   ├── Product.js            # Product stores + seed data (6 per marketplace)
│   │   ├── Order.js              # Order store + factory
│   │   └── WebhookConfig.js      # Webhook config + error simulation state
│   ├── services/
│   │   ├── authService.js        # Registration, login, profile logic
│   │   ├── productService.js     # Product listing + detail lookup
│   │   ├── orderService.js       # Order flow orchestration
│   │   ├── stockService.js       # Stock update logic (single + bulk)
│   │   └── webhookService.js     # Webhook delivery + configuration
│   ├── utils/
│   │   ├── jwt.js                # Token generation + verification
│   │   └── responses.js          # Standardized HTTP response helpers
│   └── app.js                    # Express app initialization
├── .env                          # Environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js                     # Entry point — starts HTTP listener
```

---

## 🧪 Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set base URL**: `http://localhost:4000/api`
3. **Login first**: Call `POST /api/auth/login` and copy the `token` from the response
4. **Set Bearer token**: In the Collection's Authorization tab, set `Bearer Token` = your token
5. **Get a product ID**: Call `GET /api/shopee/products` and copy an `item_id`
6. **Create an order**: Call `POST /api/shopee/orders` with the product ID

---

## 🌱 Environment Variables

| Variable            | Default                          | Description                          |
|---------------------|----------------------------------|--------------------------------------|
| `PORT`              | `4000`                           | HTTP server port                     |
| `NODE_ENV`          | `development`                    | Environment mode                     |
| `JWT_SECRET`        | *(see .env)*                     | Secret key for JWT signing           |
| `JWT_EXPIRES_IN`    | `7d`                             | JWT token expiry duration            |
| `DEFAULT_WEBHOOK_URL` | `http://localhost:3000/api/webhook` | Default aggregator webhook URL |
| `WEBHOOK_TIMEOUT_MS`| `5000`                           | Webhook delivery timeout in ms       |

---

## 🔒 Authentication Flow

```
Client                    API
  │                        │
  │  POST /auth/login      │
  │──────────────────────▶│
  │                        │  Verify email + password
  │  { token: "eyJ..." }  │
  │◀──────────────────────│
  │                        │
  │  GET /shopee/products  │
  │  Authorization: Bearer │
  │──────────────────────▶│
  │                        │  Verify JWT → attach req.user
  │  { products: [...] }  │
  │◀──────────────────────│
```

---

## ⚡ Order Flow with Webhook

```
Client                    API                    Aggregator
  │                        │                          │
  │  POST /shopee/orders   │                          │
  │──────────────────────▶│                          │
  │                        │ 1. Validate auth         │
  │                        │ 2. Find product          │
  │                        │ 3. Check stock           │
  │                        │ 4. Create order record   │
  │                        │ 5. Decrement stock       │
  │  { order: {...} }     │                          │
  │◀──────────────────────│                          │
  │                        │ 6. POST webhook ────────▶│
  │                        │    (fire & forget)       │
```

---

## 📄 License

ISC
