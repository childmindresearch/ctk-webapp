<script lang="ts">
    import { Combobox } from "@skeletonlabs/skeleton-svelte"
    import { type FilterSetFormData } from "./utils"
    import FormInput from "$lib/components/FormInput.svelte"
    import { toaster } from "$lib/utils"
    import { slide } from "svelte/transition"

    type Props = {
        filterSet: Partial<FilterSetFormData>
        onSubmit: (filterSet: FilterSetFormData) => void
        serviceAutoCompletions: string[]
        locationAutoCompletions: string[]
    }

    let {
        filterSet: initialFilterSet,
        onSubmit,
        serviceAutoCompletions = [],
        locationAutoCompletions = []
    }: Props = $props()

    let filterSet = $state({
        name: initialFilterSet.name || "",
        serviceIds: initialFilterSet.serviceIds || [],
        locationIds: initialFilterSet.locationIds || [],
        ...initialFilterSet
    })

    const serviceCompletions = serviceAutoCompletions.map(service => ({
        label: service,
        value: service
    }))

    const locationCompletions = locationAutoCompletions.map(location => ({
        label: location,
        value: location
    }))

    function addService() {
        if (!filterSet.serviceIds) {
            filterSet.serviceIds = []
        }
        // Don't add if we already have an empty selection
        if (!filterSet.serviceIds.includes(0)) {
            filterSet.serviceIds.push(0)
        }
    }

    function removeService(index: number) {
        if (!filterSet.serviceIds) return
        filterSet.serviceIds = filterSet.serviceIds.filter((_, i) => i !== index)
    }

    function addLocation() {
        if (!filterSet.locationIds) {
            filterSet.locationIds = []
        }
        // Don't add if we already have an empty selection
        if (!filterSet.locationIds.includes(0)) {
            filterSet.locationIds.push(0)
        }
    }

    function removeLocation(index: number) {
        if (!filterSet.locationIds) return
        filterSet.locationIds = filterSet.locationIds.filter((_, i) => i !== index)
    }

    function localOnSubmit() {
        if (!filterSet.name.trim()) {
            toaster.error({ title: "Please enter a filter set name." })
            return
        }

        // Filter out any unselected services/locations (id = 0)
        const validServiceIds = filterSet.serviceIds?.filter(id => id > 0) || []
        const validLocationIds = filterSet.locationIds?.filter(id => id > 0) || []

        if (validServiceIds.length === 0) {
            toaster.error({ title: "Please select at least one service." })
            return
        }

        if (validLocationIds.length === 0) {
            toaster.error({ title: "Please select at least one location." })
            return
        }

        onSubmit({
            ...filterSet,
            serviceIds: validServiceIds,
            locationIds: validLocationIds
        } as FilterSetFormData)
    }

    // Initialize with at least one service and location if empty
    if (!filterSet.serviceIds?.length) {
        addService()
    }
    if (!filterSet.locationIds?.length) {
        addLocation()
    }
</script>

<div class="max-w-4xl mx-auto p-6">
    <form onsubmit={localOnSubmit} class="overflow-y-auto max-h-[95vh] space-y-6">
        <!-- Filter Set Information -->
        <section class="card p-6 space-y-6 variant-glass-surface">
            <div class="flex items-center gap-3 border-b border-surface-300-600-token pb-3">
                <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
                <h3 class="h3 text-primary-700-200-token">Filter Set Information</h3>
            </div>
            <div class="grid gap-6">
                <FormInput
                    label="Filter Set Name"
                    required
                    placeholder="Enter filter set name (e.g., 'Mental Health Services', 'Brooklyn Providers')"
                    bind:value={filterSet.name}
                />
            </div>
        </section>

        <!-- Services Section -->
        <section class="card p-6 space-y-6 variant-glass-surface">
            <div class="flex items-center justify-between border-b border-surface-300-600-token pb-3">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-8 bg-secondary-500 rounded-full"></div>
                    <h3 class="h3 text-secondary-700-200-token">Services Filter</h3>
                </div>
                <button type="button" class="btn btn-sm preset-filled-primary-500" onclick={addService}>
                    <span>+</span>
                    <span>Add Service</span>
                </button>
            </div>
            <div class="space-y-4">
                <p class="text-sm text-surface-600-300-token">
                    Select the services that should be included in this filter set. Providers offering any of these
                    services will be shown.
                </p>
                <div class="space-y-3">
                    {#if filterSet.serviceIds}
                        {#each filterSet.serviceIds as serviceId, service_index}
                            <div
                                class="flex gap-3 items-center p-4 bg-surface-100-800-token rounded-lg"
                                transition:slide={{ duration: 200 }}
                            >
                                <div class="flex-1">
                                    <label class="label">
                                        <span class="text-sm font-semibold text-surface-700-200-token">
                                            Service {service_index + 1}
                                            <span class="text-error-500">*</span>
                                        </span>
                                        <Combobox
                                            data={serviceCompletions}
                                            value={serviceId ? [serviceId.toString()] : []}
                                            onValueChange={e => {
                                                if (filterSet.serviceIds) {
                                                    filterSet.serviceIds[service_index] = parseInt(e.value[0]) || 0
                                                }
                                            }}
                                            label="Select a service"
                                            placeholder="Choose service..."
                                            zIndex="2"
                                            required
                                        />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    class="btn btn-sm preset-filled-error-500"
                                    onclick={() => removeService(service_index)}
                                >
                                    Remove
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </section>

        <!-- Locations Section -->
        <section class="card p-6 space-y-6 variant-glass-surface">
            <div class="flex items-center justify-between border-b border-surface-300-600-token pb-3">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-8 bg-tertiary-500 rounded-full"></div>
                    <h3 class="h3 text-tertiary-700-200-token">Locations Filter</h3>
                </div>
                <button type="button" class="btn btn-sm preset-filled-primary-500" onclick={addLocation}>
                    <span>+</span>
                    <span>Add Location</span>
                </button>
            </div>
            <div class="space-y-4">
                <p class="text-sm text-surface-600-300-token">
                    Select the locations that should be included in this filter set. Providers serving any of these
                    locations will be shown.
                </p>
                <div class="space-y-3">
                    {#if filterSet.locationIds}
                        {#each filterSet.locationIds as locationId, location_index}
                            <div
                                class="flex gap-3 items-center p-4 bg-surface-100-800-token rounded-lg"
                                transition:slide={{ duration: 200 }}
                            >
                                <div class="flex-1">
                                    <label class="label">
                                        <span class="text-sm font-semibold text-surface-700-200-token">
                                            Location {location_index + 1}
                                            <span class="text-error-500">*</span>
                                        </span>
                                        <Combobox
                                            data={locationCompletions}
                                            value={locationId ? [locationId.toString()] : []}
                                            onValueChange={e => {
                                                if (filterSet.locationIds) {
                                                    filterSet.locationIds[location_index] = parseInt(e.value[0]) || 0
                                                }
                                            }}
                                            label="Select a location"
                                            placeholder="Choose location..."
                                            zIndex="2"
                                            required
                                        />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    class="btn btn-sm preset-filled-error-500"
                                    onclick={() => removeLocation(location_index)}
                                >
                                    Remove
                                </button>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </section>

        <!-- Submit Section -->
        <div class="flex justify-end pt-6 border-t border-surface-300-600-token">
            <button class="btn preset-filled-secondary-500 text-md" type="submit"> Submit </button>
        </div>
    </form>
</div>
