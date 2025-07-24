<script lang="ts">
    import FormInput from "$lib/components/FormInput.svelte"
    import { oxfordComma } from "$lib/utils"
    import { slide } from "svelte/transition"

    type Props = {
        section: {
            name: string
            locations: string[]
            services: string[]
        }
        serviceAutoCompletions: string[]
        locationAutoCompletions: string[]
    }

    let { section = $bindable(), serviceAutoCompletions = [], locationAutoCompletions = [] }: Props = $props()
    let autoName = $state(true)
    $effect(() => {
        if (autoName) {
            if (section.locations.length === 0 && section.services.length === 0) {
                section.name = ""
            }
            section.name = oxfordComma(section.locations) + "; " + oxfordComma(section.services)
        }
    })
</script>

<section class="card p-6 space-y-6" transition:slide>
    <div class="grid gap-6">
        <FormInput
            label="Table Name"
            placeholder="Table group name (appears above table in document)"
            bind:value={section.name}
            oninput={() => (autoName = false)}
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
                <input class="checkbox" type="checkbox" value={location} bind:group={section.locations} />
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
                <input class="checkbox" type="checkbox" value={service} bind:group={section.services} />
                {service}
            </label>
        {/each}
    </div>
</section>
