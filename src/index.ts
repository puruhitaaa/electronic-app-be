import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import { db } from "./db/index"
import type { Context } from "hono"
import { products, categories, suppliers } from "./db/schema"
import { eq } from "drizzle-orm"

const app = new OpenAPIHono()

app.get("/", (c: Context) => {
  return c.text("Hello, this is the Electronic App Backend!")
})

const ListProductsRoute = createRoute({
  method: "get",
  path: "/api/products",
  responses: {
    200: {
      description: "List products",
      content: {
        "application/json": {
          schema: z.array(
            z.object({
              id: z.number(),
              sku: z.string(),
              name: z.string(),
              description: z.string().nullable().optional(),
              price_cents: z.number(),
              category_id: z.number().nullable().optional(),
              supplier_id: z.number().nullable().optional(),
              created_at: z.string().optional(),
            })
          ),
        },
      },
    },
  },
})

app.openapi(ListProductsRoute, async (c: Context) => {
  const rows = await db.select().from(products)
  const normalized = rows.map((r) => ({
    ...r,
    created_at:
      r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
  }))
  return c.json<z.infer<typeof ProductSchema>[], 200>(normalized, 200)
})

// Create a product
const ProductCreateSchema = z
  .object({
    sku: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    price_cents: z.number().optional(),
    category_id: z.number().nullable().optional(),
    supplier_id: z.number().nullable().optional(),
  })
  .openapi("ProductCreate")

const ProductSchema = z
  .object({
    id: z.number(),
    sku: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    price_cents: z.number(),
    category_id: z.number().nullable().optional(),
    supplier_id: z.number().nullable().optional(),
    created_at: z.string().optional(),
  })
  .openapi("Product")
const NotFoundSchema = z.object({ message: z.string() }).openapi("NotFound")

const CreateProductRoute = createRoute({
  method: "post",
  path: "/api/products",
  request: {
    body: {
      required: true,
      content: {
        "application/json": {
          schema: ProductCreateSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Created product",
      content: {
        "application/json": {
          schema: ProductSchema,
        },
      },
    },
  },
})

app.openapi(CreateProductRoute, async (c: Context) => {
  // `createRoute` already defines validation, but we also parse the request body with Zod
  // to get proper TypeScript types here without `as any`.
  const body = ProductCreateSchema.parse(await c.req.json())
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

  const product = {
    ...inserted[0],
    created_at: inserted[0].created_at?.toISOString(),
  }
  return c.json<z.infer<typeof ProductSchema>, 201>(product, 201)
})

// Get by id
const ProductParams = z.object({
  id: z.number().openapi({
    param: { name: "id", in: "path" },
    example: 1,
  }),
})

const GetProductRoute = createRoute({
  method: "get",
  path: "/api/products/{id}",
  request: { params: ProductParams },
  responses: {
    200: {
      description: "Get product",
      content: { "application/json": { schema: ProductSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
})

app.openapi(GetProductRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  const row = await db.select().from(products).where(eq(products.id, id))
  if (row.length === 0)
    return c.json<z.infer<typeof NotFoundSchema>, 404>(
      { message: "Not found" },
      404
    )
  const product = { ...row[0], created_at: row[0].created_at?.toISOString() }
  return c.json<z.infer<typeof ProductSchema>, 200>(product, 200)
})

// OpenAPI doc and swagger ui
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    title: "Electronic Store API",
    version: "1.0.0",
  },
})

app.get("/ui", swaggerUI({ url: "/doc" }))

// Update product
const UpdateProductBody = ProductCreateSchema

const UpdateProductRoute = createRoute({
  method: "put",
  path: "/api/products/{id}",
  request: {
    params: ProductParams,
    body: {
      required: true,
      content: { "application/json": { schema: UpdateProductBody } },
    },
  },
  responses: {
    200: {
      description: "Updated product",
      content: { "application/json": { schema: ProductSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
})

app.openapi(UpdateProductRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  const body = UpdateProductBody.parse(await c.req.json())
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

  if (updated.length === 0)
    return c.json<z.infer<typeof NotFoundSchema>, 404>(
      { message: "Not found" },
      404
    )
  const product = {
    ...updated[0],
    created_at: updated[0].created_at?.toISOString(),
  }
  return c.json<z.infer<typeof ProductSchema>, 200>(product, 200)
})

// Delete product
const DeleteProductRoute = createRoute({
  method: "delete",
  path: "/api/products/{id}",
  request: { params: ProductParams },
  responses: { 204: { description: "Deleted product" } },
})

app.openapi(DeleteProductRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  await db.delete(products).where(eq(products.id, id))
  return new Response(null, { status: 204 })
})

// Categories CRUD
const CategorySchema = z
  .object({ id: z.number(), name: z.string() })
  .openapi("Category")
const CategoryCreateSchema = z
  .object({ name: z.string() })
  .openapi("CategoryCreate")

const ListCategoriesRoute = createRoute({
  method: "get",
  path: "/api/categories",
  responses: {
    200: {
      description: "List categories",
      content: { "application/json": { schema: z.array(CategorySchema) } },
    },
  },
})

app.openapi(ListCategoriesRoute, async (c: Context) => {
  const rows = await db.select().from(categories)
  const normalized = rows
  return c.json<z.infer<typeof CategorySchema>[], 200>(normalized, 200)
})

const CreateCategoryRoute = createRoute({
  method: "post",
  path: "/api/categories",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: CategoryCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "Created category",
      content: { "application/json": { schema: CategorySchema } },
    },
  },
})

app.openapi(CreateCategoryRoute, async (c: Context) => {
  const body = CategoryCreateSchema.parse(await c.req.json())
  const inserted = await db
    .insert(categories)
    .values({ name: body.name })
    .returning()
  const created = inserted[0]
  return c.json<z.infer<typeof CategorySchema>, 201>(created, 201)
})

const CategoryParams = z.object({
  id: z.number().openapi({ param: { name: "id", in: "path" } }),
})
const GetCategoryRoute = createRoute({
  method: "get",
  path: "/api/categories/{id}",
  request: { params: CategoryParams },
  responses: {
    200: {
      description: "Get a category",
      content: { "application/json": { schema: CategorySchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
})

app.openapi(GetCategoryRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  const row = await db.select().from(categories).where(eq(categories.id, id))
  if (row.length === 0)
    return c.json<z.infer<typeof NotFoundSchema>, 404>(
      { message: "Not found" },
      404
    )
  return c.json<z.infer<typeof CategorySchema>, 200>(row[0], 200)
})

const UpdateCategoryRoute = createRoute({
  method: "put",
  path: "/api/categories/{id}",
  request: {
    params: CategoryParams,
    body: {
      required: true,
      content: { "application/json": { schema: CategoryCreateSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated category",
      content: { "application/json": { schema: CategorySchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
})

app.openapi(UpdateCategoryRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  const body = CategoryCreateSchema.parse(await c.req.json())
  await db
    .update(categories)
    .set({ name: body.name })
    .where(eq(categories.id, id))
  const updated = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
  if (updated.length === 0)
    return c.json<z.infer<typeof NotFoundSchema>, 404>(
      { message: "Not found" },
      404
    )
  return c.json<z.infer<typeof CategorySchema>, 200>(updated[0], 200)
})

const DeleteCategoryRoute = createRoute({
  method: "delete",
  path: "/api/categories/{id}",
  request: { params: CategoryParams },
  responses: { 204: { description: "Deleted" } },
})
app.openapi(DeleteCategoryRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  await db.delete(categories).where(eq(categories.id, id))
  return new Response(null, { status: 204 })
})

// Suppliers
const SupplierSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    contact_email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  })
  .openapi("Supplier")
const SupplierCreateSchema = z
  .object({
    name: z.string(),
    contact_email: z.string().optional(),
    phone: z.string().optional(),
  })
  .openapi("SupplierCreate")

const ListSuppliersRoute = createRoute({
  method: "get",
  path: "/api/suppliers",
  responses: {
    200: {
      description: "List suppliers",
      content: { "application/json": { schema: z.array(SupplierSchema) } },
    },
  },
})
app.openapi(ListSuppliersRoute, async (c: Context) => {
  const rows = await db.select().from(suppliers)
  return c.json<z.infer<typeof SupplierSchema>[], 200>(rows, 200)
})

const CreateSupplierRoute = createRoute({
  method: "post",
  path: "/api/suppliers",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: SupplierCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "Created supplier",
      content: { "application/json": { schema: SupplierSchema } },
    },
  },
})

app.openapi(CreateSupplierRoute, async (c: Context) => {
  const body = SupplierCreateSchema.parse(await c.req.json())
  const inserted = await db
    .insert(suppliers)
    .values({
      name: body.name,
      contact_email: body.contact_email ?? null,
      phone: body.phone ?? null,
    })
    .returning()
  return c.json<z.infer<typeof SupplierSchema>, 201>(inserted[0], 201)
})

const SupplierParams = z.object({
  id: z.number().openapi({ param: { name: "id", in: "path" } }),
})
const GetSupplierRoute = createRoute({
  method: "get",
  path: "/api/suppliers/{id}",
  request: { params: SupplierParams },
  responses: {
    200: {
      description: "Supplier by id",
      content: { "application/json": { schema: SupplierSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
})

app.openapi(GetSupplierRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  const row = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (row.length === 0)
    return c.json<z.infer<typeof NotFoundSchema>, 404>(
      { message: "Not found" },
      404
    )
  return c.json<z.infer<typeof SupplierSchema>, 200>(row[0], 200)
})

const UpdateSupplierRoute = createRoute({
  method: "put",
  path: "/api/suppliers/{id}",
  request: {
    params: SupplierParams,
    body: {
      required: true,
      content: { "application/json": { schema: SupplierCreateSchema } },
    },
  },
  responses: {
    200: {
      description: "Updated supplier",
      content: { "application/json": { schema: SupplierSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: NotFoundSchema } },
    },
  },
})

app.openapi(UpdateSupplierRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  const body = SupplierCreateSchema.parse(await c.req.json())
  await db
    .update(suppliers)
    .set({
      name: body.name,
      contact_email: body.contact_email ?? null,
      phone: body.phone ?? null,
    })
    .where(eq(suppliers.id, id))
  const updated = await db.select().from(suppliers).where(eq(suppliers.id, id))
  if (updated.length === 0)
    return c.json<z.infer<typeof NotFoundSchema>, 404>(
      { message: "Not found" },
      404
    )
  return c.json<z.infer<typeof SupplierSchema>, 200>(updated[0], 200)
})

const DeleteSupplierRoute = createRoute({
  method: "delete",
  path: "/api/suppliers/{id}",
  request: { params: SupplierParams },
  responses: { 204: { description: "Deleted" } },
})

app.openapi(DeleteSupplierRoute, async (c: Context) => {
  const id = Number(c.req.param("id"))
  await db.delete(suppliers).where(eq(suppliers.id, id))
  return new Response(null, { status: 204 })
})

export default app
