import { db } from "$lib/server/db"
import { templates } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"

export async function GET() {
    logger.info("Getting all templates")
    const rows = await db.select().from(templates)
    return json(rows)
}
