import "dotenv/config"
import { db } from "./index"
import { categories, suppliers, products, inventory } from "./schema"

async function main() {
  console.log("Seeding DB...")

  const laptopCat = await db
    .insert(categories)
    .values({ name: "Laptops" })
    .returning()
  const audioCat = await db
    .insert(categories)
    .values({ name: "Audio" })
    .returning()

  const supplierA = await db
    .insert(suppliers)
    .values({ name: "Acme Parts", contact_email: "info@acmeparts.dev" })
    .returning()

  const product1 = await db
    .insert(products)
    .values({
      sku: "LAP-1000",
      name: "Super Laptop A",
      description: "Lightweight laptop with long battery life",
      price_cents: 99900,
      category_id: laptopCat[0].id,
      supplier_id: supplierA[0].id,
    })
    .returning()

  const product2 = await db
    .insert(products)
    .values({
      sku: "EAR-2000",
      name: "Noise-Cancelling Earbuds",
      description: "Wireless earbuds with ANC",
      price_cents: 19900,
      category_id: audioCat[0].id,
      supplier_id: supplierA[0].id,
    })
    .returning()

  await db
    .insert(inventory)
    .values({ product_id: product1[0].id, quantity: 15, restock_threshold: 5 })
  await db
    .insert(inventory)
    .values({ product_id: product2[0].id, quantity: 40, restock_threshold: 10 })

  console.log("Seeded demo categories, suppliers, products, and inventory.")
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => {
      process.exit(0)
    })
}
