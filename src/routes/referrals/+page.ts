import type { getProviders, getFilterGroups } from "$api/referrals/crud"

export const load = async ({ fetch }) => {
  const providersPromise = fetch("/api/referrals/providers").then(response => response.json()) as ReturnType<
    typeof getProviders
  >
  const filterGroupsPromise = fetch("/api/referrals/filter-groups").then(response => response.json()) as ReturnType<
    typeof getFilterGroups
  >
  const [providers, filterGroups] = await Promise.all([providersPromise, filterGroupsPromise])
  return { providers, filterGroups }
}
