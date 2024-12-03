import { referralProviders } from "$lib/server/db/schema"

export const load = async ({ fetch }) => {
    const data = (await fetch("/api/referrals/providers").then(
        async (response: Response) => await response.json()
    )) as (typeof referralProviders.$inferSelect)[]
    return { data }
}
