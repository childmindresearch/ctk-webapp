import { db } from "$lib/server/db"
import { referralAreaCovered } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export async function POST({ request }) {
    logger.info("Creating a referral area.")

    const schema = createInsertSchema(referralAreaCovered)
    try {
        const data = schema.parse(await request.json())
        const newRow = await db.insert(referralAreaCovered).values(data).returning()
        return json(newRow[0])
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid area data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }

        logger.error("Failed to create area.", { error })
        return json({ error: "Failed to create area." }, { status: 500 })
    }
}

export async function GET() {
    logger.info("Geting all areas.")
    try {
        const rows = await db.query.referralAreaCovered.findMany()
        return json(rows)
    } catch (error) {
        logger.error("Failed to get area.", { error })
        return json({ error: "Failed to get area." }, { status: 500 })
    }
}
