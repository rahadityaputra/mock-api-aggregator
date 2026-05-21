# Mock e-commerce API

Mock API untuk shopee, tokped, lazada.

---

## Step Instalasi

### 1. Install dependencies

```bash
npm install
```

### 2. Config env

```bash
copy .env .env.local
```

### 3. Start the server

```bash
npm run dev
npm start
```

API berjalan di port 4000: **`http://localhost:4000/api`**

---

## Seed Account

| Field    | Value            |
|----------|------------------|
| Email    | `test@example.com` |
| Password | `password123`    |
| Username | `testuser`       |

---

## Perbedaan Antar e-commerce

| Nama Field   | Shopee         | Tokopedia     | Lazada        |
|--------------|----------------|---------------|---------------|
| Product ID   | `item_id`      | `product_id`  | `id`          |
| SKU          | `model_sku`    | `sku`         | `seller_sku`  |
| Nama Produk  | `item_name`    | `name`        | `name`        |
| Stock        | `stock`        | `stock`       | `available`   |
| Category     | `category`     | `category`    | `primary_category` |
| Rating       | `item_rating`  | `rating`      | `rating_score`|
| SKU Prefix   | `SHP-*`        | `TOK-*`       | `LZD-*`       |

---

## API Reference

### Base URL
```
http://localhost:4000/api
```

---

### Health Check

#### `GET /health`
```bash
curl http://localhost:4000/health
```

---

### Auth

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

### Produk

#### `GET /api/:marketplace/products`
List products with optional filters.

```bash
curl "http://localhost:4000/api/shopee/products"
curl "http://localhost:4000/api/tokopedia/products?category=Electronics&page=1&limit=5"
curl "http://localhost:4000/api/lazada/products?search=earbuds&minPrice=100000&maxPrice=500000"
```

Query Parameters:
| Param      | Tipe   | Deskripsi                           |
|------------|--------|-------------------------------------|
| `page`     | number | Halaman (default: 1)            |
| `limit`    | number | Jumlah data per halaman (default: 20, max: 100) |
| `category` | string | Filter berdasarkan kategori    |
| `search`   | string | Pencarian di nama produk dan SKU      |
| `minPrice` | number | Minimum price filter                |
| `maxPrice` | number | Maximum price filter                |

#### `GET /api/:marketplace/products/:id`

```bash
curl "http://localhost:4000/api/shopee/products/PRODUCT_ITEM_ID"
```

---

### Orders

#### `POST /api/:marketplace/orders`
Buat order, validasi stock, simpan data order, pengurangan stock, dan trigger webhook.

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

### Stock Management 

#### `PUT /api/:marketplace/stock/:sku`

```bash
curl -X PUT http://localhost:4000/api/shopee/stock/SHP-ELEC-001 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stock": 250}'
```

#### `PUT /api/:marketplace/stock/bulk`

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

### Webhook System

#### `POST /api/:marketplace/webhook/config`

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

### E-Commerce Operation

#### `GET /api/:marketplace/status`
status, jumlah product/order , dan config webhook.

```bash
curl http://localhost:4000/api/shopee/status
```

#### `POST /api/:marketplace/reset`
Reset data dari e-commerce. 

```bash
curl -X POST http://localhost:4000/api/shopee/reset
```

#### `POST /api/:marketplace/simulate-error`
Simulasi error.

```bash
curl -X POST http://localhost:4000/api/shopee/simulate-error \
  -H "Content-Type: application/json" \
  -d '{"mode": "rate_limit"}'

# Mode yang tersedia:
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

## Project Structure

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
