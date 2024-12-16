import type { ExtendedProvider } from "$lib/server/types"

export const load = async ({ fetch }) => {
    const data = (await fetch("/api/referrals/providers").then(response => response.json())) as ExtendedProvider[]
    return { data }
}
