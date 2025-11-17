import { Hono } from "hono"
import { db } from "./db/index"
import { products } from "./db/schema"

const app = new Hono()

app.get("/", (c) => {
  return c.text("Hello Hono!")
})

app.get("/api/products", async (c) => {
  const rows = await db.select().from(products)
  return c.json(rows)
})

export default app
