import { db } from "$lib/server/db"
import {
    providersToAreasCovered,
    providersToLanguages,
    providersToServices,
    referralAreaCovered,
    referralLanguages,
    referralProviders,
    referralServices
} from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import type { ExtendedProvider } from "$lib/server/types"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"
import { postSchema, relationships } from "./utils"

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
        const rows = await db
            .select()
            .from(referralProviders)
            .leftJoin(providersToLanguages, eq(referralProviders.id, providersToLanguages.providerId))
            .leftJoin(referralLanguages, eq(providersToLanguages.languageId, referralLanguages.id))
            .leftJoin(providersToAreasCovered, eq(referralProviders.id, providersToAreasCovered.providerId))
            .leftJoin(referralAreaCovered, eq(providersToAreasCovered.areaCoveredId, referralAreaCovered.id))
            .leftJoin(providersToServices, eq(referralProviders.id, providersToServices.providerId))
            .leftJoin(referralServices, eq(providersToServices.serviceId, referralServices.id))

        const result = rows.reduce((acc: ExtendedProvider[], row) => {
            const language = row.referral_languages
            const service = row.referral_services
            const areaCovered = row.referral_area_covered
            const provider = row.referral_providers as ExtendedProvider

            let index = acc.findIndex(p => p.id === provider.id)
            if (index === -1) {
                provider.languages = []
                provider.services = []
                provider.areasCovered = []
                index = acc.push(provider) - 1
            }

            if (language && !acc[index].languages?.find(lang => lang.id === language.id))
                acc[index].languages?.push(language)
            if (service && !acc[index].services?.find(serv => serv.id === service.id))
                acc[index].services?.push(service)
            if (areaCovered && !acc[index].areasCovered?.find(area => area.id === areaCovered.id))
                acc[index].areasCovered?.push(areaCovered)
            return acc
        }, [])

        return json(result)
    } catch (error) {
        logger.error("Failed to get providers.", { error })
        return json({ error: "Failed to get providers." }, { status: 500 })
    }
}
