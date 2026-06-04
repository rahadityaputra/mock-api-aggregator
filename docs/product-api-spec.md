# Product API Specification

Dokumen ini menjelaskan API domain product untuk mock marketplace backend. Marketplace ditentukan dari path URL, misalnya `/api/shopee/products`, jadi client tidak perlu mengirim field `marketplace` di request body.

## Base URL

```text
/api/:marketplace/products
```

`marketplace` yang didukung:

- `shopee`
- `tokopedia`
- `lazada`

## Data Model

### Product

```json
{
  "id": "uuid",
  "marketplace": "shopee",
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
  "images": ["/uploads/products/iphone1.jpg", "/uploads/products/iphone2.jpg"],
  "createdAt": "2026-05-27T00:00:00.000Z",
  "updatedAt": "2026-05-27T00:00:00.000Z"
}
```

### Product Status

- `ACTIVE`
- `DRAFT`
- `ARCHIVED`

### Image Rules

- Minimal 1 image
- Maksimal 5 image
- Format yang umum dipakai: `jpg`, `jpeg`, `png`, `webp`
- Image disajikan sebagai URL lokal di bawah `/uploads/products`
- Jika `thumbnail_url` tidak dikirim saat create, sistem memakai image pertama

## Endpoints

### List Products

```http
GET /api/:marketplace/products
```

Query parameters:

- `page` - default `1`
- `limit` - default `20`, maksimum `100`
- `search` - pencarian nama produk atau SKU
- `category` - filter kategori
- `status` - filter status produk
- `minPrice` - filter harga minimum
- `maxPrice` - filter harga maksimum

Catatan:

- endpoint ini tidak butuh autentikasi
- `status` default-nya `ACTIVE` jika tidak dikirim oleh client

Example:

```http
GET /api/shopee/products?search=iphone&status=ACTIVE&page=1&limit=20
```

Response example:

```json
{
  "success": true,
  "items": [
    {
      "id": "prod_01",
      "marketplace": "shopee",
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
      "createdAt": "2026-05-27T00:00:00.000Z",
      "updatedAt": "2026-05-27T00:00:00.000Z",
      "images": [
        "/uploads/products/iphone1.jpg",
        "/uploads/products/iphone2.jpg"
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### Get Product Detail

```http
GET /api/:marketplace/products/:id
```

Contoh:

```http
GET /api/shopee/products/prod_01
```

### Create Product

```http
POST /api/:marketplace/products
```

Authentication:

- Internal API key required (`X-Internal-Secret`)

Request body:

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
  "images": ["/uploads/products/iphone1.jpg", "/uploads/products/iphone2.jpg"]
}
```

Required fields:

- `product_name`
- `marketplace_sku`
- `internal_sku`
- `category`
- `price`
- `stock`
- `weight`
- `images`

Notes:

- `price` harus integer non-negative
- `stock` harus integer non-negative
- `weight` harus number positif
- `status` default valid values adalah `ACTIVE`, `DRAFT`, `ARCHIVED`
- `status` optional, default `ACTIVE`
- `thumbnail_url` optional; jika kosong, sistem memakai image pertama dari `images`
- `images` wajib minimal 1 item dan maksimal 5 item
- nilai `images` akan disimpan sebagai list URL string

### Update Product

```http
PATCH /api/:marketplace/products/:id
```

Authentication:

- Internal API key required (`X-Internal-Secret`)

Request body supports partial update:

```json
{
  "product_name": "iPhone 15 Pro Max",
  "description": "Updated description",
  "category": "Smartphone",
  "brand": "Apple",
  "price": 19500000,
  "stock": 12,
  "weight": 210,
  "thumbnail_url": "/uploads/products/iphone1-new.jpg",
  "status": "ACTIVE",
  "images": [
    "/uploads/products/iphone1-new.jpg",
    "/uploads/products/iphone2-new.jpg"
  ]
}
```

Notes:

- request body boleh berisi field parsial
- jika tidak ada field yang bisa di-update, request ditolak
- `images` tetap harus 1-5 item jika dikirim

### Update Stock

```http
PATCH /api/:marketplace/products/:id/stock
```

Request body:

```json
{
  "stock": 25
}
```

Authentication:

- Internal API key required (`X-Internal-Secret`)

### Delete Product

```http
DELETE /api/:marketplace/products/:id
```

Perilaku delete adalah soft delete. Product tidak dihapus permanen, tetapi status-nya berubah menjadi `ARCHIVED`.

Authentication:

- Internal API key required (`X-Internal-Secret`)

## Validation Rules

- `marketplace_sku` harus unik per marketplace
- `internal_sku` harus unik per marketplace
- `images` wajib minimal 1 item dan maksimal 5 item
- `product_name`, `marketplace_sku`, `internal_sku`, dan `category` wajib saat create
- field yang tidak berubah tidak perlu dikirim saat update
- `status` valid: `ACTIVE`, `DRAFT`, `ARCHIVED`
- `thumbnail_url` saat create akan otomatis diisi dari image pertama bila tidak dikirim
- `GET /api/:marketplace/products/:id/stock` tidak tersedia; update stock dilakukan lewat `PATCH /api/:marketplace/products/:id/stock`

## Webhook Context

Saat product dan order dipakai bersama, sistem mengirim payload notifikasi order dengan format berikut:

```json
{
  "event": "ORDER_CREATED",
  "marketplace": "Shopee",
  "marketplace_sku": "SHP-IPH15PRO",
  "qty": 1
}
```

## Quick Examples

Shopee list:

```http
GET /api/shopee/products
```

Shopee create:

```http
POST /api/shopee/products
```

Tokopedia update stock:

```http
PATCH /api/tokopedia/products/prod_01/stock
```

Lazada delete:

```http
DELETE /api/lazada/products/prod_01
```
