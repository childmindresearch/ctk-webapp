import { db } from "$lib/server/db"
import { templates } from "$lib/server/db/schema"

export async function load() {
    const templateRows = await db.select().from(templates)
    return { templateRows }
}
