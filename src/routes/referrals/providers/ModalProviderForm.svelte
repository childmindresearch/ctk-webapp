<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton"
    import MultiSelect from "../MultiSelect.svelte"

    const modalStore = getModalStore()

    let name: string = $state($modalStore[0].meta?.name ?? "")

    let addresses: Array<{
        addressLine1?: string
        addressLine2?: string
        city?: string
        state?: string
        zipCode?: string
    }> = $state($modalStore[0].meta?.addresses ?? [{}])

    const multiSelectKeys = ["Locations"] as const
    const multiSelects: Record<(typeof multiSelectKeys)[number], string> = {
        Locations: "/api/referrals/providers/locations"
    }
    const idsSelected: Record<(typeof multiSelectKeys)[number], { id: number; name: string }[]> = {
        Locations: $modalStore[0].meta?.locations ?? []
    }

    function addAddress() {
        addresses = [...addresses, {}]
    }

    function removeAddress(index: number) {
        addresses = addresses.filter((_, i) => i !== index)
    }

    function onSubmit() {
        if ($modalStore[0].response) {
            const validAddresses = addresses.filter(
                addr => addr.addressLine1 || addr.city || addr.state || addr.zipCode
            )

            $modalStore[0].response({
                name: name,
                addresses: validAddresses.length > 0 ? validAddresses : undefined,
                locations:
                    idsSelected.Locations.length > 0
                        ? idsSelected.Locations.map(loc => ({ locationId: loc.id }))
                        : undefined
            })
            modalStore.close()
        }
    }
</script>

{#if $modalStore[0]}
    <div class="card fixed p-12 rounded-3xl w-modal-wide space-y-4 max-h-[70vh] overflow-y-auto">
        <form onsubmit={onSubmit} class="space-y-2">
            <label class="label">
                <span>Provider Name *</span>
                <input class="input" required bind:value={name} />
            </label>

            <!-- Addresses Section -->
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="h3">Addresses</h3>
                    <button type="button" class="btn btn-sm variant-ghost-primary" onclick={addAddress}>
                        Add Address
                    </button>
                </div>

                {#each addresses as address, index}
                    <div class="card p-4 space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold">Address {index + 1}</span>
                            <button
                                type="button"
                                class="btn btn-sm variant-ghost-error"
                                onclick={() => removeAddress(index)}
                            >
                                Remove
                            </button>
                        </div>

                        <label class="label">
                            <span>Address Line 1</span>
                            <input class="input" bind:value={address.addressLine1} />
                        </label>

                        <label class="label">
                            <span>Address Line 2</span>
                            <input class="input" bind:value={address.addressLine2} />
                        </label>

                        <div class="grid grid-cols-2 gap-2">
                            <label class="label">
                                <span>City</span>
                                <input class="input" bind:value={address.city} />
                            </label>

                            <label class="label">
                                <span>State</span>
                                <input class="input" bind:value={address.state} />
                            </label>
                        </div>

                        <label class="label">
                            <span>ZIP Code</span>
                            <input class="input" bind:value={address.zipCode} />
                        </label>
                    </div>
                {/each}
            </div>

            <!-- Locations Selection -->
            {#each multiSelectKeys as name}
                <MultiSelect
                    {name}
                    endpoint={multiSelects[name]}
                    allowCreate={true}
                    isSelected={idsSelected[name].map(selection => selection.name)}
                    onSelect={selection => (idsSelected[name] = selection)}
                />
            {/each}

            <button class="btn variant-filled-primary" type="submit"> Create Provider </button>
        </form>
    </div>
{/if}
