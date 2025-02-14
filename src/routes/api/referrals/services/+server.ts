import { db } from "$lib/server/db"
import { referralServices } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export async function POST({ request }) {
    logger.info("Creating a language.")

    const schema = createInsertSchema(referralServices)
    try {
        const data = schema.parse(await request.json())
        const newRow = await db.insert(referralServices).values(data).returning()
        return json(newRow[0])
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid service data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }

        logger.error("Failed to create service.", { error })
        return json({ error: "Failed to create service." }, { status: 500 })
    }
}

export async function GET() {
    logger.info("Getting all services.")
    try {
        const rows = await db.query.referralServices.findMany()
        return json(rows)
    } catch (error) {
        logger.error("Failed to get service.", { error })
        return json({ error: "Failed to get services." }, { status: 500 })
    }
}
