import {
    type referralLanguages,
    type referralProviders,
    type referralAreaCovered,
    type referralServices
} from "$lib/server/db/schema"

export const load = async ({ fetch }) => {
    const [providers, languages, areasCovered, services] = await Promise.all([
        fetch("/api/referrals/providers").then(response => response.json()) as Promise<
            (typeof referralProviders.$inferSelect)[]
        >,
        fetch("/api/referrals/languages").then(response => response.json()) as Promise<
            (typeof referralLanguages.$inferSelect)[]
        >,
        fetch("/api/referrals/areas-covered").then(response => response.json()) as Promise<
            (typeof referralAreaCovered.$inferSelect)[]
        >,
        fetch("/api/referrals/services").then(response => response.json()) as Promise<
            (typeof referralServices.$inferSelect)[]
        >
    ])

    return {
        providers,
        languages,
        areasCovered,
        services
    }
}
