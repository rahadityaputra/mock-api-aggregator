# Internal Authentication

Dokumen ini menjelaskan middleware `authorizeInternalRequest` yang dipakai untuk mengamankan endpoint internal lewat header `X-Internal-Secret`.

## Endpoint Yang Menggunakan

Daftar endpoint yang saat ini menggunakan `authorizeInternalRequest`:

- `POST /api/:marketplace/products`
- `PATCH /api/:marketplace/products/:id`
- `DELETE /api/:marketplace/products/:id`
- `PATCH /api/:marketplace/products/:id/stock`

Status pendukung yang sudah tersedia:

- Middleware tersedia di `src/middlewares/internalAuthentication.js`
- Skema security `InternalSecret` sudah disiapkan di `src/docs/openapi.js`
- Header `X-Internal-Secret` sudah diizinkan di konfigurasi CORS aplikasi

Catatan:

- Endpoint GET product tetap public dan tidak memakai internal key
- Endpoint di atas adalah endpoint manajemen product yang hanya boleh diakses oleh service internal

## URL Endpoint Internal

Dokumen ini memakai pola URL internal berikut untuk client-facing reference:

- `POST /api/internal/sync`
- `POST /api/internal/refresh-cache`
- `POST /api/internal/rebuild-search-index`
- `POST /api/internal/webhooks/trigger`

Semua endpoint internal di atas wajib mengirim `X-Internal-Secret`.

Catatan:

- URL di atas adalah pola endpoint internal yang disiapkan untuk integrasi service-to-service.
- Saat ini route tersebut belum terpasang di router aplikasi, jadi daftar ini adalah kontrak dokumentasi untuk endpoint internal yang akan dipakai jika diaktifkan.

## Konfigurasi

### Header Wajib

Request internal harus mengirim header berikut:

```http
X-Internal-Secret: <secret>
```

### Environment Variable

Nilai secret diambil dari environment variable berikut:

```bash
INTERNAL_API_KEY
```

Jika `INTERNAL_API_KEY` tidak diset, aplikasi memakai nilai default development:

```bash
dev-internal-key
```

### Perilaku Middleware

Middleware melakukan validasi berurutan:

1. Cek apakah header `X-Internal-Secret` ada.
2. Bandingkan nilainya dengan `INTERNAL_API_KEY`.
3. Jika cocok, request dilanjutkan ke handler berikutnya.

Response yang dihasilkan:

- `401 Unauthorized` jika header tidak dikirim
- `403 Forbidden` jika secret tidak cocok

### Contoh Pemakaian

Pola penggunaan di route Express:

```js
import { authorizeInternalRequest } from '../middlewares/internalAuthentication.js';

router.post('/internal/sync', authorizeInternalRequest, handler);
```

Contoh request:

```http
POST /api/internal/sync
X-Internal-Secret: dev-internal-key
```

## Catatan Implementasi

- Middleware ini cocok untuk endpoint yang hanya boleh diakses oleh service lain, job internal, atau admin service.
- Middleware ini tidak menggantikan JWT user authentication.
- Untuk endpoint publik atau endpoint user biasa, gunakan middleware auth yang sesuai.
- Jika endpoint internal ditambahkan nanti, sebaiknya tambahkan juga security scheme `InternalSecret` pada OpenAPI untuk endpoint tersebut.
