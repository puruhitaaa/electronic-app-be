## <span style="color: green">**Basis Data - Drizzle ORM + Neon**</span>

Proyek ini mencakup pengaturan Drizzle ORM sederhana untuk toko elektronik kecil.

1. Tambahkan string koneksi Neon/Postgres ke `.env` Anda (gunakan `.env.example` sebagai templat):

```
DATABASE_URL=postgresql://username:password@host:5432/database
```

2. Instal dependensi (Bun):

```bash
bun install
```

3. Buat & jalankan migrasi (opsional):

```bash
# buat migrasi berdasarkan perubahan skema
npx drizzle-kit generate

# atau dorong skema secara langsung
npx drizzle-kit push
```

4. Jalankan skrip seed untuk memasukkan contoh kategori, pemasok, produk, dan inventaris:

```bash
bun src/db/seed.ts
```

5. Contoh endpoint API untuk mencantumkan produk: `/api/products`.

<span style="color: green">**Contoh endpoint CRUD yang ditambahkan:**</span>

- GET `/api/products` — daftar produk
- POST `/api/products` — buat produk (Body JSON: sku, name, description, price_cents, category_id, supplier_id)
- GET `/api/products/:id` — dapatkan produk berdasarkan id
- PUT `/api/products/:id` — perbarui produk
- DELETE `/api/products/:id` — hapus produk

- GET `/api/categories` — daftar kategori
- POST `/api/categories` — buat kategori (Body JSON { name })
- GET `/api/categories/:id` — dapatkan kategori berdasarkan id
- PUT `/api/categories/:id` — perbarui kategori
- DELETE `/api/categories/:id` — hapus kategori

<span style="color: green">**Endpoint Pemasok:**</span>

- GET `/api/suppliers`
- POST `/api/suppliers` — Body JSON: name, contact_email, phone
- GET `/api/suppliers/:id`
- PUT `/api/suppliers/:id`
- DELETE `/api/suppliers/:id`

<span style="color: green">**Contoh cURL untuk membuat produk:**</span>

```bash
curl -X POST http://localhost:3000/api/products \
	-H 'Content-Type: application/json' \
	-d '{"sku":"NN-001","name":"Sample Device","price_cents":19900}'
```

Catatan: konfigurasi ini menggunakan `@neondatabase/serverless` dengan `drizzle-orm/neon-http` untuk koneksi HTTP yang ramah serverless ke Neon.

<span style="color: green">**Untuk menginstal dependensi:**</span>

```sh
bun install
```

<span style="color: green">**Untuk menjalankan:**</span>

```sh
bun run dev
```

buka http://localhost:3000

## <span style="color: green">**OpenAPI + Swagger UI**</span>

Proyek ini menggunakan `zod` dan `@hono/zod-openapi` untuk memvalidasi skema permintaan dan membuat spesifikasi OpenAPI secara otomatis. Spesifikasi dipasang di `/doc` dan Swagger UI disajikan di `/ui`.

- Instal paket: `bun install` (atau `npm install` jika Anda lebih suka npm)
- Mulai server: `bun run dev`
- Buka JSON OpenAPI yang dibuat secara otomatis di `http://localhost:3000/doc`
- Lihat Swagger UI di `http://localhost:3000/ui`

Catatan: Tipe pengembalian handler TypeScript yang digunakan oleh `@hono/zod-openapi` bisa ketat; proyek ini mem-parsing body permintaan dengan Zod dan menggunakan pengembalian `TypedResponse<...>` untuk menjaga tipe yang kuat dan menghindari penggunaan `as any`.
