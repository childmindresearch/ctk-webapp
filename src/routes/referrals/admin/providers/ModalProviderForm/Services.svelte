<script lang="ts">
    import { Slider } from "@skeletonlabs/skeleton-svelte"
    import { Combobox } from "@skeletonlabs/skeleton-svelte"
    import { type ProviderFormData } from "../utils"
    import { isUnique } from "$lib/utils"

    type Props = {
        provider: ProviderFormData
        serviceAutoCompletions: string[]
        subServiceAutoCompletions: Record<(typeof serviceAutoCompletions)[number], string[]>
        onChange: (data: { service: string; subServices: string[]; minAge: number; maxAge: number }) => void
    }
    const { provider, serviceAutoCompletions, subServiceAutoCompletions, onChange = () => {} }: Props = $props()

    let service = $state(provider.service)
    let subServices = $state(provider.subServices)
    let minAge = $state(provider.minAge)
    let maxAge = $state(provider.maxAge)
    let currentSubServiceAutoCompletions = $derived(
        (subServiceAutoCompletions[service] || []).map(name => {
            return { label: name, value: name }
        })
    )

    $inspect(provider)

    const serviceCompletions = serviceAutoCompletions.filter(isUnique).map(s => {
        return { label: s, value: s }
    })

    function emitChange() {
        onChange({ service, subServices, minAge, maxAge })
    }

    function addSubService() {
        subServices.push("")
        emitChange()
    }

    function removeSubService(index: number) {
        subServices = subServices.filter((_: any, i: number) => i !== index)
        emitChange()
    }

    function handleServiceChange(e: { value: string[] }) {
        service = e.value[0]
        emitChange()
    }

    function handleSubServiceChange(index: number, e: { value: string[] }) {
        subServices[index] = e.value[0]
        emitChange()
    }

    function handleAgeChange(e: { value: [number, number] }) {
        minAge = e.value[0]
        maxAge = e.value[1]
        emitChange()
    }
</script>

<section class="card p-6 space-y-6 variant-glass-surface">
    <div class="flex items-center gap-3 border-b border-surface-300-600-token pb-3">
        <div class="w-2 h-8 bg-secondary-500 rounded-full"></div>
        <h3 class="h3 text-secondary-700-200-token">Services Offered</h3>
    </div>

    <div class="grid gap-6">
        <label class="label">
            <span class="text-sm font-semibold text-surface-700-200-token">Primary Service Type</span>
            <Combobox
                data={serviceCompletions}
                value={[service]}
                defaultValue={[service]}
                onValueChange={handleServiceChange}
                label="Select or type a service"
                placeholder="Select..."
                allowCustomValue
                zIndex="2"
                required
            />
        </label>

        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h4 class="h4 text-surface-700-200-token">Subservices</h4>
                <button type="button" class="btn btn-sm preset-filled-primary-500" onclick={addSubService}>
                    <span>+</span>
                    <span>Add Service</span>
                </button>
            </div>

            <div class="space-y-3">
                {#each subServices as _, subservice_index}
                    <div class="flex gap-3 items-center p-3 bg-surface-100-800-token rounded-lg">
                        <Combobox
                            allowCustomValue
                            data={currentSubServiceAutoCompletions}
                            value={[subServices[subservice_index]]}
                            defaultValue={[subServices[subservice_index]]}
                            onValueChange={event => handleSubServiceChange(subservice_index, event)}
                            label="Select or type a sub-service"
                            placeholder="Select..."
                            zIndex="2"
                            required
                        />

                        <button
                            type="button"
                            class="btn btn-sm preset-filled-error-500"
                            onclick={() => removeSubService(subservice_index)}
                        >
                            Remove
                        </button>
                    </div>
                {/each}
            </div>
        </div>

        <label class="label">
            <span class="text-sm font-semibold text-surface-700-200-token"
                >Age Range: {minAge || 0}-{maxAge || 120}</span
            >
            <div class="text-sm">Note: Age range is inclusive on both sides i.e. "only minors" would be "0-17".</div>
            <Slider min={0} max={120} step={1} value={[minAge || 0, maxAge || 120]} onValueChange={handleAgeChange} />
        </label>
    </div>
</section>
