import { db } from "$lib/server/db"
import { referralProviders } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { relationships } from "../utils"
import { putSchemaProvider } from "../schemas"

export async function PUT({ request, params }) {
    const id = Number(params.id)
    logger.info(`Modifying provider ${id}.`)

    try {
        const validatedBody = putSchemaProvider.parse(await request.json())
        const providerData = createInsertSchema(referralProviders).parse(validatedBody)
        await db.transaction(async tx => {
            await tx.update(referralProviders).set(providerData).where(eq(referralProviders.id, id))

            await Promise.all(
                relationships.map(async relation => {
                    const schema = createInsertSchema(relation.junctionTable)
                    const keys = schema.keyof().options
                    const [otherKey] = keys.filter(key => key != "providerId")

                    await tx.delete(relation.junctionTable).where(eq(relation.junctionTable.providerId, id))
                    const postSchema = validatedBody[relation.bodyName].map(item => {
                        return schema.parse({
                            providerId: id,
                            [otherKey]: item.id
                        })
                    })
                    return tx.insert(relation.junctionTable).values(postSchema)
                })
            )
        })
        const newModel: {
            [key: string]: string | boolean | number | undefined | null | { id: number; name: string }[]
        } = providerData
        newModel["languages"] = validatedBody.languages
        newModel["services"] = validatedBody.services
        newModel["id"] = id

        return json(newModel)
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
    if (deletedRow.length !== 0) {
        return json("OK")
    }
    logger.error("Failed to delete provider.")
    return json({ error: "Failed to delete provider." }, { status: 500 })
}
