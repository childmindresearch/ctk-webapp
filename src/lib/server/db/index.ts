import { DATABASE_URL } from "$lib/server/environment"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "$lib/server/db/schema"

export const db = drizzle(DATABASE_URL, { schema })
