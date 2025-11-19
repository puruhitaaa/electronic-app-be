## Database - Drizzle ORM + Neon

This project includes a simple Drizzle ORM setup for a small electronics store.

1. Add a Neon/Postgres connection string to your `.env` (use `.env.example` as a template):

```
DATABASE_URL=postgresql://username:password@host:5432/database
```

2. Install dependencies (Bun):

```bash
bun install
```

3. Generate & run migrations (optional):

```bash
# generate a migration based on schema changes
npx drizzle-kit generate

# or push schema directly
npx drizzle-kit push
```

4. Run the seed script to insert example categories, suppliers, products and inventory:

```bash
bun src/db/seed.ts
```

5. Example API endpoint to list products: `/api/products`.

Example CRUD endpoints added:

- GET `/api/products` — list products
- POST `/api/products` — create a product (JSON body: sku, name, description, price_cents, category_id, supplier_id)
- GET `/api/products/:id` — get product by id
- PUT `/api/products/:id` — update product
- DELETE `/api/products/:id` — delete product

- GET `/api/categories` — list categories
- POST `/api/categories` — create a category (JSON body { name })
- GET `/api/categories/:id` — get category by id
- PUT `/api/categories/:id` — update category
- DELETE `/api/categories/:id` — delete category

Suppliers endpoints:

- GET `/api/suppliers`
- POST `/api/suppliers` — JSON body: name, contact_email, phone
- GET `/api/suppliers/:id`
- PUT `/api/suppliers/:id`
- DELETE `/api/suppliers/:id`

Example cURL to create a product:

```bash
curl -X POST http://localhost:3000/api/products \
	-H 'Content-Type: application/json' \
	-d '{"sku":"NN-001","name":"Sample Device","price_cents":19900}'
```

Notes: this configuration uses `@neondatabase/serverless` with `drizzle-orm/neon-http` for serverless-friendly HTTP connections to Neon.

To install dependencies:

```sh
bun install
```

To run:

```sh
bun run dev
```

open http://localhost:3000

## OpenAPI + Swagger UI

This project uses `zod` and `@hono/zod-openapi` to validate request schemas and auto-generate an OpenAPI spec. The spec is mounted at `/doc` and Swagger UI is served at `/ui`.

- Install packages: `bun install` (or `npm install` if you prefer npm)
- Start server: `bun run dev`
- Open the auto-generated OpenAPI JSON at `http://localhost:3000/doc`
- View Swagger UI at `http://localhost:3000/ui`

Note: TypeScript handler return types used by `@hono/zod-openapi` can be strict; this project parses request bodies with Zod and uses `TypedResponse<...>` returns to keep strong types and avoid `as any` casts.
