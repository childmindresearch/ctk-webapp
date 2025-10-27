<script lang="ts">
    import { type FilterSetFormData } from "../utils"
    import type { z } from "zod"
    import type { PostFilterGroup } from "$api/referrals/filter-groups/schemas"
    import FilterSetForm from "./FilterSetForm.svelte"
    import FormInput from "$lib/components/FormInput.svelte"

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

    let filterGroup = $state({
        filterSets: [
            {
                name: "",
                locations: [] as string[],
                services: [] as string[]
            }
        ],
        name: "",
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
</script>

<div class="max-w-4xl mx-auto p-6">
    <form onsubmit={() => onSubmit(filterGroup)} class="overflow-y-auto max-h-[95vh]">
        <!-- Filter Set Information -->
        <section class="card p-6 space-y-6 variant-glass-surface">
            <div class="flex items-center gap-3 border-b border-surface-300-600-token pb-3">
                <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
                <h3 class="text-lg font-semibold">Document Information</h3>
            </div>
            <FormInput label="Document Name" required placeholder="Document Name" bind:value={filterGroup.name} />
        </section>

        <!-- Tables Section -->
        <div class="space-y-6">
            {#each filterGroup.filterSets as fGroup, index (fGroup)}
                <div class="flex items-center gap-3">
                    <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
                    <h2 class="text-xl font-semibold">Table {index + 1}</h2>
                </div>
                <div class="flex items-center justify-between border-b pb-3">
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
                <FilterSetForm
                    bind:section={filterGroup.filterSets[index]}
                    {locationAutoCompletions}
                    {serviceAutoCompletions}
                />
            {/each}

            <div class="flex justify-center">
                <button type="button" class="btn preset-filled-secondary-500" onclick={addTable}> Add Table </button>
            </div>
        </div>
        <button class="btn preset-filled-primary-500" type="submit"> Submit </button>
    </form>
</div>
