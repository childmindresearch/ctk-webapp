import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
export const POSTGRES_DB = process.env.POSTGRES_DB
export const POSTGRES_PORT = Number(process.env.POSTGRES_PORT)

export const DATABASE_URL = `postgres://${{ POSTGRES_USER }}:${{ POSTGRES_PASSWORD }}@${{ POSTGRES_HOST }}:${{ POSTGRES_PORT }}/${{ POSTGRES_DB }}`

export default defineConfig({
    out: "./drizzle",
    schema: "./src/lib/server/db/schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: DATABASE_URL
    }
})
