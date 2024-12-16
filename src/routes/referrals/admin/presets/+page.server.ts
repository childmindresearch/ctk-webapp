import { referralPresets } from "$lib/server/db/schema"

export const load = async ({ fetch }) => {
    const presets = (await fetch("/api/referrals/presets").then(response =>
        response.json()
    )) as (typeof referralPresets.$inferSelect)[]
    return { presets }
}
