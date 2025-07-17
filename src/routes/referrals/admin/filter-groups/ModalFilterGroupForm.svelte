<script lang="ts">
    import { type FilterSetFormData } from "./utils"
    import FormInput from "$lib/components/FormInput.svelte"
    import type { z } from "zod"
    import { slide } from "svelte/transition"
    import type { PostFilterGroup } from "$api/referrals/filter-groups/schemas"
    type Props = {
        filterGroup: Partial<FilterSetFormData>
        onSubmit: (filterSet: z.infer<typeof PostFilterGroup>) => void
        serviceAutoCompletions: string[]
        locationAutoCompletions: string[]
    }
    let {
        filterGroup: initialFilterGroup,
        onSubmit,
        serviceAutoCompletions = [],
        locationAutoCompletions = []
    }: Props = $props()

    let filterGroup: z.infer<typeof PostFilterGroup> = $state({
        name: "",
        filterSets: [
            {
                name: "",
                locations: [],
                services: []
            }
        ],
        ...initialFilterGroup
    })

    function addTable() {
        filterGroup.filterSets = [
            ...filterGroup.filterSets,
            {
                name: "",
                locations: [],
                services: []
            }
        ]
    }
    function removeTable(index: number) {
        if (filterGroup.filterSets.length > 1) {
            filterGroup.filterSets = filterGroup.filterSets.filter((_, i) => i !== index)
        }
    }

    function onServiceClick(event: Event, filterSet: (typeof filterGroup.filterSets)[number], service: string) {
        const target = event.target as HTMLInputElement
        if (target.checked) {
            filterSet.services.push(service)
        } else {
            filterSet.services = filterSet.services.filter(serv => {
                serv !== service
            })
        }
    }
</script>

<div class="max-w-4xl mx-auto p-6">
    <form onsubmit={() => onSubmit(filterGroup)} class="overflow-y-auto max-h-[95vh]">
        <!-- Filter Set Information -->
        <section class="card p-6 space-y-6 variant-glass-surface">
            <div class="flex items-center gap-3 border-b border-surface-300-600-token pb-3">
                <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
                <h3 class="text-lg font-semibold">Document Information</h3>
            </div>
            <div class="grid gap-6">
                <FormInput
                    label="Document Name"
                    required
                    placeholder="Document name (e.g., 'Mental Health Services', 'Brooklyn Providers')"
                    bind:value={filterGroup.name}
                />
            </div>
        </section>
        <!-- Tables Section -->
        <div class="space-y-6">
            {#each filterGroup.filterSets as section, index}
                <section class="card p-6 space-y-6" transition:slide>
                    <div class="flex items-center justify-between border-b pb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
                            <h2 class="text-xl font-semibold">Table {index + 1}</h2>
                        </div>
                        {#if filterGroup.filterSets.length > 1}
                            <button
                                type="button"
                                class="btn preset-filled-error-500"
                                onclick={() => removeTable(index)}
                                title="Remove table"
                            >
                                Remove
                            </button>
                        {/if}
                    </div>
                    <div class="grid gap-6">
                        <FormInput
                            label="Table Name"
                            placeholder="Table group name (appears above table in document)"
                            bind:value={section.name}
                        />
                    </div>
                    <div class="flex items-center gap-3 border-b pb-3">
                        <div class="w-2 h-8 bg-secondary-500 rounded-full"></div>
                        <h3 class="text-lg font-semibold">Locations</h3>
                    </div>
                    <div class="grid grid-cols-3">
                        {#each locationAutoCompletions as location}
                            <label
                                class="flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:preset-filled-surface-200-800 hover:shadow-sm"
                            >
                                <input
                                    class="checkbox"
                                    type="checkbox"
                                    value={location}
                                    bind:group={section.locations}
                                />
                                {location}
                            </label>
                        {/each}
                    </div>
                    <div class="flex items-center gap-3 border-b pb-3">
                        <div class="w-2 h-8 bg-secondary-500 rounded-full"></div>
                        <h3 class="text-lg font-semibold">Services</h3>
                    </div>
                    <div class="grid grid-cols-3">
                        {#each serviceAutoCompletions as service}
                            <label
                                class="flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:preset-filled-surface-200-800 hover:shadow-sm"
                            >
                                <input
                                    class="checkbox"
                                    type="checkbox"
                                    value={service}
                                    onchange={e => onServiceClick(e, section, service)}
                                />
                                {service}
                            </label>
                        {/each}
                    </div>
                </section>
            {/each}
            <!-- Add Table Button -->
            <div class="flex justify-center">
                <button type="button" class="btn preset-filled-secondary-500" onclick={addTable}> Add Table </button>
            </div>
        </div>
        <button class="btn preset-filled-primary-500" type="submit"> Submit </button>
    </form>
</div>
