import { db } from "$lib/server/db"
import { referralProviders } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { getExtendedProviders, postSchema, relationships } from "./utils"

/**
 * Creates a provider in the database.
 * @param {Request} request - The request, see postSchema for the body.
 * @returns The created provider along with its relationships.
 */
export async function POST({ request }) {
    logger.info("Creating a provider.")

    try {
        const validatedBody = postSchema.parse(await request.json())
        const providerData = createInsertSchema(referralProviders).parse(validatedBody)

        await db.transaction(async tx => {
            const [createdProvider] = await tx.insert(referralProviders).values(providerData).returning()

            await Promise.all(
                relationships.map(async relation => {
                    const schema = createInsertSchema(relation.junctionTable)
                    const keys = schema.keyof().options
                    const [otherKey] = keys.filter(key => key != "providerId")
                    const postSchema = validatedBody[relation.bodyName].map(item => {
                        return schema.parse({
                            providerId: createdProvider.id,
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
        newModel["areasCovered"] = validatedBody.areasCovered

        return json(newModel)
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid provider data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }
        logger.error("Failed to create provider.", { error })
        return json({ error: "Failed to create provider." }, { status: 500 })
    }
}

/**
 *
 * @returns Returns all providers in the database, joined with their languages, services, and areas covered.
 */
export async function GET() {
    logger.info("Geting all providers.")
    try {
        return getExtendedProviders()
    } catch (error) {
        logger.error("Failed to get providers.", { error })
        return json({ error: "Failed to get providers." }, { status: 500 })
    }
}
