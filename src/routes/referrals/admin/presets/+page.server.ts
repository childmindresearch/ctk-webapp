import { type referralLanguages, type referralAreaCovered, type referralServices } from "$lib/server/db/schema"
import type { ExtendedPreset } from "$lib/server/types.js"

export const load = async ({ fetch }) => {
    const presetsPromise = fetch("/api/referrals/presets").then(response => response.json()) as Promise<
        ExtendedPreset[]
    >
    const languagesPromise = fetch("/api/referrals/languages").then(response => response.json()) as Promise<
        (typeof referralLanguages.$inferSelect)[]
    >
    const servicesPromise = fetch("/api/referrals/services").then(response => response.json()) as Promise<
        (typeof referralServices.$inferSelect)[]
    >
    const areasCoveredPromise = fetch("/api/referrals/areas-covered").then(response => response.json()) as Promise<
        (typeof referralAreaCovered.$inferSelect)[]
    >

    const [presets, languages, services, areasCovered] = await Promise.all([
        presetsPromise,
        languagesPromise,
        servicesPromise,
        areasCoveredPromise
    ])
    return { presets, languages, services, areasCovered }
}
