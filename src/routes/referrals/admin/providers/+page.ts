import type { getProviders } from "$api/referrals/crud.js"

export const load = async ({ fetch }) => {
  const providers = await fetch("/api/referrals/providers").then(response => response.json())
  return { providers } as { providers: Awaited<ReturnType<typeof getProviders>> }
}
