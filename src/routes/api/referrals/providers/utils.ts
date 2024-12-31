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
import type { ExtendedProvider } from "$lib/server/types"
import { eq } from "drizzle-orm"

export const relationships = [
    {
        junctionTable: providersToLanguages,
        mainTable: referralLanguages,
        bodyName: "languages"
    },
    {
        junctionTable: providersToServices,
        mainTable: referralServices,
        bodyName: "services"
    },
    {
        junctionTable: providersToAreasCovered,
        mainTable: referralAreaCovered,
        bodyName: "areasCovered"
    }
] as const

export async function getExtendedProviders(ids: number[] | undefined = undefined) {
    const rows = await db
        .select()
        .from(referralProviders)
        .leftJoin(providersToLanguages, eq(referralProviders.id, providersToLanguages.providerId))
        .leftJoin(referralLanguages, eq(providersToLanguages.languageId, referralLanguages.id))
        .leftJoin(providersToAreasCovered, eq(referralProviders.id, providersToAreasCovered.providerId))
        .leftJoin(referralAreaCovered, eq(providersToAreasCovered.areaCoveredId, referralAreaCovered.id))
        .leftJoin(providersToServices, eq(referralProviders.id, providersToServices.providerId))
        .leftJoin(referralServices, eq(providersToServices.serviceId, referralServices.id))

    let result = rows.reduce((acc: ExtendedProvider[], row) => {
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
        if (service && !acc[index].services?.find(serv => serv.id === service.id)) acc[index].services?.push(service)
        if (areaCovered && !acc[index].areasCovered?.find(area => area.id === areaCovered.id))
            acc[index].areasCovered?.push(areaCovered)
        return acc
    }, [])

    if (ids) {
        result = result.filter(r => ids.includes(r.id))
    }

    return result
}
