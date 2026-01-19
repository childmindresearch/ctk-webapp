<!--
@component Filters

A comprehensive filtering component for provider data that supports multiple filter types including
multi-select filters for top-level properties, location-based filtering, and age range filtering.

This component provides a user interface for filtering provider data through various criteria:
- **Top-level filters**: Multi-select filters for provider properties like insurance acceptance and service type
- **Location filters**: Multi-select filter for provider addresses/locations
- **Age filters**: Numeric input to filter providers based on participant age range

The component uses a cascading filter approach where filters are applied in sequence:
1. Age filtering (filters providers based on minAge/maxAge range)
2. Location filtering (removes addresses outside selected locations, excludes providers with no remaining addresses)
3. Top-level property filtering (filters based on provider attributes)

@props
- `providers` (GetProviderResponse) - Array of provider objects to be filtered
- `onChange` (function) - Callback function that receives the filtered provider array whenever filters change
- `topLevelFilters` (bindable, Partial<Record<string, string>>) - Object containing top-level filter selections (acceptsInsurance, serviceType)
- `locationFilters` (bindable, string[]) - Array of selected location strings for filtering
- `participantAge` (bindable, number | null) - Age value for filtering providers by age range
-->

<script lang="ts">
    import type { getProviders } from "$api/v1/referrals/crud.js"

    import MultiSelectFilter from "$lib/components/DataTable/MultiSelectFilter.svelte"
    import { isUnique } from "$lib/utils.js"

    const topLevelFilterNames = { acceptsInsurance: "Accepts Insurance", serviceType: "Service Type" } as const

    type Props = {
        providers: Awaited<ReturnType<typeof getProviders>>
        onChange: (filtered: Awaited<ReturnType<typeof getProviders>>) => void
        topLevelFilters: Partial<Record<keyof typeof topLevelFilterNames, string>>
        locationFilters: string[]
        participantAge: number | null
    }

    let {
        providers,
        onChange,
        topLevelFilters = $bindable(),
        locationFilters = $bindable(),
        participantAge = $bindable()
    }: Props = $props()

    const locations = $derived(providers.flatMap(p => p.addresses.map(addr => addr.location)).filter(isUnique))

    let filteredProviders = $derived(
        providers
            // Age filter
            .filter(provider => {
                if (participantAge === null) return true
                return provider.minAge <= participantAge && provider.maxAge >= participantAge
            })
            // Location filter
            .map(provider => {
                const providerCopy = { ...provider }
                if (locationFilters.length === 0) return providerCopy
                providerCopy.addresses = providerCopy.addresses.filter(addr => {
                    return locationFilters.some(location =>
                        addr.location.toLowerCase().includes(location.toLowerCase())
                    )
                })
                if (providerCopy.addresses.length === 0) {
                    return null
                }
                return providerCopy
            })
            .filter(val => val !== null)
            // Top level filters
            .filter(provider => {
                return Object.entries(topLevelFilters).every(([key, value]) => {
                    if (!value) return true
                    const providerValue = String(provider[key as keyof typeof provider]).toLowerCase()
                    const filterValues = value.split(",").map(val => val.trim().toLowerCase())
                    return filterValues.some(filterVal => providerValue.includes(filterVal))
                })
            })
    )

    $effect(() => {
        onChange(filteredProviders)
    })
</script>

<div class="flex flex-col gap-3 p-3">
    <!-- Top Level Filters -->
    {#each Object.entries(topLevelFilterNames) as [key, name] (name)}
        <div class="w-full">
            <MultiSelectFilter
                options={providers.map(p => String(p[key as keyof typeof p])).filter(isUnique)}
                {name}
                onChange={s => (topLevelFilters[key as keyof typeof topLevelFilters] = s.join(", "))}
                value={(topLevelFilters[key as keyof typeof topLevelFilters]
                    ? topLevelFilters[key as keyof typeof topLevelFilters]?.split(", ") || []
                    : []
                ).join(", ")}
            />
        </div>
    {/each}

    <!-- Location Filter -->
    <div class="w-full">
        <MultiSelectFilter
            options={locations}
            name="Location"
            onChange={s => (locationFilters = s)}
            value={locationFilters.join(", ")}
        />
    </div>

    <!-- Age Filter -->
    <div class="border rounded-lg bg-surface-50 p-3">
        <label class="block text-sm font-medium mb-2" for="participant-age"> Filter by Age: </label>
        <input
            id="participant-age"
            class="input w-full"
            type="number"
            min="0"
            max="120"
            bind:value={participantAge}
            placeholder="Enter age"
        />
    </div>
</div>
