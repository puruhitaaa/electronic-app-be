import { Hono } from "hono"
import { db } from "./db/index"
import { products, categories, suppliers } from "./db/schema"
import { eq } from "drizzle-orm"

const app = new Hono()

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.get("/api/products", async (c) => {
  const rows = await db.select().from(products)
  return c.json(rows)
})

// Create a product
app.post("/api/products", async (c) => {
  const body = await c.req.json()
  const inserted = await db
    .insert(products)
    .values({
      sku: body.sku,
      name: body.name,
      description: body.description ?? null,
      price_cents: body.price_cents ?? 0,
      category_id: body.category_id ?? null,
      supplier_id: body.supplier_id ?? null,
    })
    .returning()

  return c.json(inserted[0], 201)
})

// Get by id
app.get("/api/products/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const row = await db.select().from(products).where(eq(products.id, id))
  if (row.length === 0) return c.notFound()
  return c.json(row[0])
})

// Update product
app.put("/api/products/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const body = await c.req.json()
  await db
    .update(products)
    .set({
      sku: body.sku,
      name: body.name,
      description: body.description ?? null,
      price_cents: body.price_cents ?? 0,
      category_id: body.category_id ?? null,
      supplier_id: body.supplier_id ?? null,
    })
    .where(eq(products.id, id))

  const updated = await db.select().from(products).where(eq(products.id, id))

  if (updated.length === 0) return c.notFound()
  return c.json(updated[0])
})

// Delete product
app.delete("/api/products/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await db.delete(products).where(eq(products.id, id))
  c.status(204)
  return c.text("")
})

// Categories CRUD
app.get("/api/categories", async (c) => {
  const rows = await db.select().from(categories)
  return c.json(rows)
})

app.post("/api/categories", async (c) => {
  const body = await c.req.json()
  const inserted = await db
    .insert(categories)
    .values({ name: body.name })
    .returning()
  return c.json(inserted[0], 201)
})

app.get("/api/categories/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const row = await db.select().from(categories).where(eq(categories.id, id))
  if (row.length === 0) return c.notFound()
  return c.json(row[0])
})

app.put("/api/categories/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const body = await c.req.json()
  await db
    .update(categories)
    .set({ name: body.name })
    .where(eq(categories.id, id))
  const updated = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
  if (updated.length === 0) return c.notFound()
  return c.json(updated[0])
})

app.delete("/api/categories/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await db.delete(categories).where(eq(categories.id, id))
  c.status(204)
  return c.text("")
})

// Suppliers
app.get("/api/suppliers", async (c) => {
  const rows = await db.select().from(suppliers)
  return c.json(rows)
})

app.post("/api/suppliers", async (c) => {
  const body = await c.req.json()
  const inserted = await db
    .insert(suppliers)
    .values({
      name: body.name,
      contact_email: body.contact_email ?? null,
      phone: body.phone ?? null,
    })
    .returning()
  return c.json(inserted[0], 201)
})

app.get("/api/suppliers/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const row = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (row.length === 0) return c.notFound()
  return c.json(row[0])
})

app.put("/api/suppliers/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const body = await c.req.json()
  await db
    .update(suppliers)
    .set({
      name: body.name,
      contact_email: body.contact_email ?? null,
      phone: body.phone ?? null,
    })
    .where(eq(suppliers.id, id))
  const updated = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (updated.length === 0) return c.notFound()
  return c.json(updated[0])
})

app.delete("/api/suppliers/:id", async (c) => {
  const id = Number(c.req.param("id"))
  await db.delete(suppliers).where(eq(suppliers.id, id))
  c.status(204)
  return c.text("")
})

export default app
