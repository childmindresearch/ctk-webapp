import type { GetProviderResponse } from "$lib/types.js"

export const load = async ({ fetch }) => {
    const data = (await fetch("/api/referrals/providers").then(response => response.json())) as GetProviderResponse
    return { data }
}
