import { type referralLanguages, type referralServices } from "$lib/server/db/schema"
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

    const [presets, languages, services] = await Promise.all([presetsPromise, languagesPromise, servicesPromise])
    return { presets, languages, services }
}
