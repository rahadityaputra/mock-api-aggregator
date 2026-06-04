# Mock Marketplace Backend

This project simulates three separate e-commerce marketplaces:

- Shopee
- Tokopedia
- Lazada

It is not an aggregator. Each marketplace has its own payload schema, product shape, order flow, webhook event, and error simulation endpoint.

## Stack

- Node.js
- Express
- Prisma ORM
- MySQL
- JWT auth
- Socket.IO
- Axios
- bcrypt
- dotenv
- cors

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create a `.env` file from `.env.example` and set `DATABASE_URL`, `JWT_SECRET`, and any webhook overrides.

3. Generate Prisma Client.

```bash
DATABASE_URL="mysql://root:password@localhost:3306/mock_marketplace" npm run prisma:generate
```

4. Push the schema or run your preferred migration flow.

```bash
npm run db:push
```

5. Seed sample data.

```bash
npm run seed
```

6. Start the server.

```bash
npm run dev
```

Default base URL: `http://localhost:3000/api`

Swagger UI:

- `http://localhost:3000/api-docs`
- `http://localhost:3000/api-docs.json`

Product API spec:

- `docs/product-api-spec.md`

## Prisma Models

The database includes:

- users
- products
- orders
- order_items
- webhook_logs

## Authentication

### `POST /api/auth/register`

```json
{
  "name": "Rahaditya",
  "email": "rahaditya@example.com",
  "password": "secret123"
}
```

### `POST /api/auth/login`

Response:

```json
{
  "success": true,
  "token": "jwt_token"
}
```

### `GET /api/auth/me`

Requires `Authorization: Bearer <token>`.

## Marketplace Product Payloads

All marketplaces now use the same product payload shape:

```json
{
  "product_name": "iPhone 15 Pro",
  "marketplace_sku": "SHP-IPH15PRO",
  "internal_sku": "IPH15PRO-BLK",
  "description": "Apple flagship smartphone",
  "category": "Smartphone",
  "brand": "Apple",
  "price": 18000000,
  "stock": 15,
  "weight": 200,
  "thumbnail_url": "/uploads/products/iphone1.jpg",
  "status": "ACTIVE",
  "images": [
    "/uploads/products/iphone1.jpg",
    "/uploads/products/iphone2.jpg"
  ]
}
```

Supported product status values:

- `ACTIVE`
- `DRAFT`
- `ARCHIVED`

Images are stored locally under `/uploads/products` and exposed through the app as static files.

Create and update endpoints also accept the same generic payload shape for Shopee, Tokopedia, and Lazada.

Allowed image formats: `jpg`, `jpeg`, `png`, `webp`.

Maximum: `5` images, `5MB` per image.

## Products

Marketplace is selected from the URL path, for example `/api/shopee/products`. You do not send an extra `marketplace` field when creating or updating a product.

Public:

- `GET /api/:marketplace/products`
- `GET /api/:marketplace/products/:id`

Query params supported by list:

- `page`
- `limit`
- `search`
- `category`
- `status`

Protected:

- `POST /api/:marketplace/products`
- `PATCH /api/:marketplace/products/:id`
- `DELETE /api/:marketplace/products/:id`
- `PATCH /api/:marketplace/products/:id/stock`

Delete is soft delete and only changes product status to `ARCHIVED`.

Product detail responses include the product images array and both SKU fields.

## Orders

Protected:

- `POST /api/:marketplace/orders`
- `GET /api/:marketplace/my-orders`
- `GET /api/:marketplace/orders/:id`

Order payload examples:

Shopee:

```json
{
  "model_sku": "SHP-IP15",
  "qty": 1
}
```

Tokopedia:

```json
{
  "sku": "TOK-IP15",
  "quantity": 1
}
```

Lazada:

```json
{
  "seller_sku": "LZD-IP15",
  "quantity": 1
}
```

## Webhooks

Received webhooks are stored in `webhook_logs`.

Order-created webhook payload format:

```json
{
  "event": "ORDER_CREATED",
  "marketplace": "Shopee",
  "marketplace_sku": "SHP-IPH15PRO",
  "qty": 1
}
```

Webhook receiver:

- `POST /api/webhooks/:marketplace`

Default outbound target after order creation:

- `http://localhost:3000/api/webhooks/:marketplace`

## Error Simulation

Protected endpoint:

- `POST /api/:marketplace/simulate-error`

Supported types:

- `STOCK_FAILED`
- `WEBHOOK_FAILED`
- `TIMEOUT`

## Socket.IO Events

Emitted events:

- `new-order`
- `stock-updated`
- `order-created`

## Environment

Important variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `WEBHOOK_BASE_URL`
- `WEBHOOK_TIMEOUT_MS`
- `PORT`
