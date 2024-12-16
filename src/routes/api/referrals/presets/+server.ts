import { db } from "$lib/server/db"
import {
    providersToAreasCovered,
    providersToLanguages,
    providersToServices,
    referralAreaCovered,
    referralLanguages,
    referralPresets,
    referralServices
} from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import type { ExtendedPreset } from "$lib/server/types"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

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
            .leftJoin(providersToLanguages, eq(referralPresets.id, providersToLanguages.providerId))
            .leftJoin(referralLanguages, eq(providersToLanguages.languageId, referralLanguages.id))
            .leftJoin(providersToAreasCovered, eq(referralPresets.id, providersToAreasCovered.providerId))
            .leftJoin(referralAreaCovered, eq(providersToAreasCovered.areaCoveredId, referralAreaCovered.id))
            .leftJoin(providersToServices, eq(referralPresets.id, providersToServices.providerId))
            .leftJoin(referralServices, eq(providersToServices.serviceId, referralServices.id))

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
        logger.error("Failed to get providers.", { error })
        return json({ error: "Failed to get providers." }, { status: 500 })
    }
}
