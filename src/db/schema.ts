import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  serial,
} from "drizzle-orm/pg-core"

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
})

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contact_email: varchar("contact_email", { length: 255 }),
  phone: varchar("phone", { length: 64 }),
})

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price_cents: integer("price_cents").notNull().default(0),
  category_id: integer("category_id").references(() => categories.id),
  supplier_id: integer("supplier_id").references(() => suppliers.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  product_id: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(0),
  restock_threshold: integer("restock_threshold").notNull().default(0),
})

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  total_cents: integer("total_cents").notNull().default(0),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
})

export const order_items = pgTable("order_items", {
  id: serial("id").primaryKey(),
  order_id: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  product_id: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit_price_cents: integer("unit_price_cents").notNull().default(0),
})
