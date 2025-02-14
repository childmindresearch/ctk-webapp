import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { putSchemaPreset } from "../schemas.js"
import { createInsertSchema } from "drizzle-zod"
import { referralPresets } from "$lib/server/db/schema.js"
import { db } from "$lib/server/db/index.js"
import { eq } from "drizzle-orm"
import { relationships } from "../utils"
import { z } from "zod"

export async function PUT({ params, request }) {
    const id = Number(params.id)
    logger.info(`Updating preset ${id}`)

    try {
        const validatedBody = putSchemaPreset.parse(await request.json())
        const presetData = createInsertSchema(referralPresets).parse(validatedBody)

        await db.transaction(async tx => {
            await tx.update(referralPresets).set(presetData).where(eq(referralPresets.id, id))
            await Promise.all(
                relationships.map(async relation => {
                    const schema = createInsertSchema(relation.junctionTable)
                    const keys = schema.keyof().options
                    const [otherKey] = keys.filter(key => key != "presetId")

                    await tx.delete(relation.junctionTable).where(eq(relation.junctionTable.presetId, id))
                    const postSchema = validatedBody[relation.bodyName].map(item => {
                        return schema.parse({
                            presetId: id,
                            [otherKey]: item.id
                        })
                    })
                    return tx.insert(relation.junctionTable).values(postSchema)
                })
            )
        })

        const newModel: {
            [key: string]: string | number | { id: number; name: string }[]
        } = presetData
        newModel["languages"] = validatedBody.languages
        newModel["services"] = validatedBody.services

        return json(newModel)
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid preset data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }
        logger.error("Failed to update presets.", { error })
        return json({ error: "Failed to update presets." }, { status: 500 })
    }
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    logger.info(`Deleting preset ${id}`)

    const deletedRow = await db.delete(referralPresets).where(eq(referralPresets.id, id)).returning()
    if (deletedRow.length !== 0) {
        return json("OK")
    }
    logger.error("Failed to delete preset.")
    return json({ error: "Failed to delete preset." }, { status: 500 })
}
