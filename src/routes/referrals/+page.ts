import type { ExtendedPreset } from "$lib/server/types"

export const load = async ({ fetch }) => {
    return { presets: (await fetch("/api/referrals/presets").then(response => response.json())) as ExtendedPreset[] }
}
