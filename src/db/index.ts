import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required")
}

// `neon` creates a http client that works well in serverless environments.
const sql = neon(databaseUrl)

export const db = drizzle({ client: sql })

export default db
