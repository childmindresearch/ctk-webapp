import { db } from "$lib/server/db"
import {
    presetsToAreasCovered,
    presetsToLanguages,
    presetsToServices,
    referralAreaCovered,
    referralLanguages,
    referralPresets,
    referralServices
} from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import type { ExtendedPreset } from "$lib/server/types"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { postSchemaPreset } from "./schemas.js"
import { relationships } from "./utils.js"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

/**
 * Creates a preset in the database.
 * @param {Request} request - The request, see postSchema for the body.
 * @returns The created provider along with its relationships.
 */
export async function POST({ request }) {
    logger.info("Creating a preset.")

    try {
        const validatedBody = postSchemaPreset.parse(await request.json())
        const presetData = createInsertSchema(referralPresets).parse(validatedBody)

        await db.transaction(async tx => {
            const [createdPreset] = await tx.insert(referralPresets).values(presetData).returning()

            await Promise.all(
                relationships.map(async relation => {
                    const schema = createInsertSchema(relation.junctionTable)
                    const keys = schema.keyof().options
                    const [otherKey] = keys.filter(key => key != "presetId")
                    const postSchema = validatedBody[relation.bodyName].map(item => {
                        return schema.parse({
                            presetId: createdPreset.id,
                            [otherKey]: item.id
                        })
                    })
                    return tx.insert(relation.junctionTable).values(postSchema)
                })
            )
        })

        const newModel: {
            [key: string]: string | boolean | number | undefined | null | { id: number; name: string }[]
        } = presetData
        newModel["languages"] = validatedBody.languages
        newModel["services"] = validatedBody.services
        newModel["areasCovered"] = validatedBody.areasCovered

        return json(newModel)
    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn("Invalid preset data.", { errors: error.errors })
            return json({ errors: error.errors }, { status: 400 })
        }
        logger.error("Failed to create preset.", { error })
        return json({ error: "Failed to create preset." }, { status: 500 })
    }
}

/**
 *
 * @returns Returns all presets in the database, joined with their languages, services, and areas covered.
 */
export async function GET() {
    logger.info("Geting all presets.")

    try {
        const rows = await db
            .select()
            .from(referralPresets)
            .leftJoin(presetsToLanguages, eq(referralPresets.id, presetsToLanguages.presetId))
            .leftJoin(referralLanguages, eq(presetsToLanguages.languageId, referralLanguages.id))
            .leftJoin(presetsToAreasCovered, eq(referralPresets.id, presetsToAreasCovered.presetId))
            .leftJoin(referralAreaCovered, eq(presetsToAreasCovered.areaCoveredId, referralAreaCovered.id))
            .leftJoin(presetsToServices, eq(referralPresets.id, presetsToServices.presetId))
            .leftJoin(referralServices, eq(presetsToServices.serviceId, referralServices.id))

        const result = rows.reduce((acc: ExtendedPreset[], row) => {
            const language = row.referral_languages
            const service = row.referral_services
            const areaCovered = row.referral_area_covered
            const preset = row.referral_presets as ExtendedPreset

            let index = acc.findIndex(p => p.id === preset.id)
            if (index === -1) {
                preset.languages = []
                preset.services = []
                preset.areasCovered = []
                index = acc.push(preset) - 1
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
        logger.error("Failed to get presets.", { error })
        return json({ error: "Failed to get presets." }, { status: 500 })
    }
}
