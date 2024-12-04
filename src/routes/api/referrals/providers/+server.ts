import { db } from "$lib/server/db"
import { referralProviders } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export async function POST({ request }) {
    logger.info("Creating a provider.")

    const schema = createInsertSchema(referralProviders)
    try {
        const data = schema.parse(await request.json())
        const newRow = await db.insert(referralProviders).values(data).returning()
        return json(newRow[0])
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid provider data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }

        logger.error("Failed to create provider.", { error })
        return json({ error: "Failed to create provider." }, { status: 500 })
    }
}

export async function GET() {
    logger.info("Geting all providers.")
    try {
        const rows = await db.query.referralProviders.findMany()
        return json(rows)
    } catch (error) {
        logger.error("Failed to get providers.", { error })
        return json({ error: "Failed to get providers." }, { status: 500 })
    }
}
