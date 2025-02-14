import { db } from "$lib/server/db"
import { referralLanguages } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export async function POST({ request }) {
    logger.info("Creating a language.")

    const schema = createInsertSchema(referralLanguages)
    try {
        const data = schema.parse(await request.json())
        const newRow = await db.insert(referralLanguages).values(data).returning()
        return json(newRow[0])
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid language data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }

        logger.error("Failed to create language.", { error })
        return json({ error: "Failed to create language." }, { status: 500 })
    }
}

export async function GET() {
    logger.info("Getting all languages.")
    try {
        const rows = await db.query.referralLanguages.findMany()
        return json(rows)
    } catch (error) {
        logger.error("Failed to get languages.", { error })
        return json({ error: "Failed to get languages." }, { status: 500 })
    }
}
