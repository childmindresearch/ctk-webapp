import type { GetFilterSetResponse } from "$lib/types.js"
import type { getProviders } from "$api/referrals/crud"

export const load = async ({ fetch }) => {
    const providersPromise = fetch("/api/referrals/providers").then(response => response.json())
    const filterSetsPromise: Promise<GetFilterSetResponse> = fetch("/api/referrals/filter-sets").then(response =>
        response.json()
    )
    const [providers, filterSets] = await Promise.all([providersPromise, filterSetsPromise])
    return { providers, filterSets } as { providers: Awaited<ReturnType<typeof getProviders>>; filterSets: unknown }
}
