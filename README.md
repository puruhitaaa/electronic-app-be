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
