import type { GetProviderResponse, GetFilterSetResponse } from "$lib/types.js"

export const load = async ({ fetch }) => {
    const providersPromise: Promise<GetProviderResponse> = fetch("/api/referrals/providers").then(response =>
        response.json()
    )
    const filterSetsPromise: Promise<GetFilterSetResponse> = fetch("/api/referrals/filter-sets").then(response =>
        response.json()
    )
    const [providers, filterSets] = await Promise.all([providersPromise, filterSetsPromise])
    return { providers, filterSets }
}
