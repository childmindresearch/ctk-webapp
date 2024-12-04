import { db } from "$lib/server/db"
import { referralProviders } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

export async function PUT({ request, params }) {
    const id = Number(params.id)
    logger.info(`Modifying provider ${id}.`)

    const schema = createInsertSchema(referralProviders)

    try {
        const data = schema.parse(await request.json())
        delete data.id // Ensure ID is not overwritten.
        const newRow = await db.update(referralProviders).set(data).where(eq(referralProviders.id, id)).returning()
        return json(newRow[0])
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid provider data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }

        logger.error("Failed to overwrite provider.", { error })
        return json({ error: "Failed to overwrite provider." }, { status: 500 })
    }
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    logger.info(`Deleting provider ${id}`)

    const deletedRow = await db.delete(referralProviders).where(eq(referralProviders.id, id)).returning()
    console.log(deletedRow)
    if (deletedRow.length !== 0) {
        return json("OK")
    }
    logger.error("Failed to delete provider.")
    return json({ error: "Failed to delete provider." }, { status: 500 })
}
