import { db } from "$lib/server/db"
import {
    presetsToAreasCovered,
    presetsToLanguages,
    presetsToServices,
    providersToAreasCovered,
    providersToLanguages,
    providersToServices,
    referralPresets,
    referralProviders
} from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { and, exists, inArray, eq } from "drizzle-orm"
import { getExtendedProviders } from "../../utils.js"

/**
 *
 * @returns Returns all providers in the database that match the preset.
 */
export async function GET({ params }) {
    const id = Number(params.id)
    logger.info(`Getting providers for preset ${id}`)
    try {
        const presetRequirements = await db
            .select()
            .from(referralPresets)
            .where(eq(referralPresets.id, id))
            .leftJoin(presetsToLanguages, eq(referralPresets.id, presetsToLanguages.presetId))
            .leftJoin(presetsToAreasCovered, eq(referralPresets.id, presetsToAreasCovered.presetId))
            .leftJoin(presetsToServices, eq(referralPresets.id, presetsToServices.presetId))

        const languageIds = presetRequirements.map(r => r.presets_to_languages?.languageId).filter(Boolean)
        const areaIds = presetRequirements.map(r => r.presets_to_areas_covered?.areaCoveredId).filter(Boolean)
        const serviceIds = presetRequirements.map(r => r.presets_to_services?.serviceId).filter(Boolean)

        const conditions = []
        if (languageIds.length > 0) {
            conditions.push(
                exists(
                    db
                        .select()
                        .from(providersToLanguages)
                        .where(
                            and(
                                eq(providersToLanguages.providerId, referralProviders.id),
                                // @ts-expect-error
                                inArray(providersToLanguages.languageId, languageIds)
                            )
                        )
                )
            )
        }

        if (areaIds.length > 0) {
            conditions.push(
                exists(
                    db
                        .select()
                        .from(providersToAreasCovered)
                        .where(
                            and(
                                eq(providersToAreasCovered.providerId, referralProviders.id),
                                // @ts-expect-error
                                inArray(providersToAreasCovered.areaCoveredId, areaIds)
                            )
                        )
                )
            )
        }

        if (serviceIds.length > 0) {
            conditions.push(
                exists(
                    db
                        .select()
                        .from(providersToServices)
                        .where(
                            and(
                                eq(providersToServices.providerId, referralProviders.id),
                                // @ts-expect-error
                                inArray(providersToServices.serviceId, serviceIds)
                            )
                        )
                )
            )
        }

        const matchingProviders = await db
            .select()
            .from(referralProviders)
            .where(conditions.length > 0 ? and(...conditions) : undefined)

        const extendedProviders = await getExtendedProviders(matchingProviders.map(p => p.id))
        return json(extendedProviders)
    } catch (error) {
        logger.error("Failed to get providers.", { error })
        return json({ error: "Failed to get providers." }, { status: 500 })
    }
}
