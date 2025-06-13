import type { GetProviderResponse } from "$lib/types.js"

export const load = async ({ fetch }) => {
    const data = (await fetch("/api/referrals/providers").then(response => response.json()))
        .providers as GetProviderResponse
    return { data }
}
