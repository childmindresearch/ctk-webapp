<script lang="ts">
    import { Combobox } from "@skeletonlabs/skeleton-svelte"
    import FormInput from "$lib/components/FormInput.svelte"
    import { toaster } from "$lib/utils"
    import { slide } from "svelte/transition"
    import type { getProviders } from "$api/referrals/crud.js"

    type Props = {
        addresses: Omit<Awaited<ReturnType<typeof getProviders>>[number]["addresses"][number], "id" | "providerId">[]
        locationAutoCompletions?: string[]
        onChange: (
            addrs: Omit<Awaited<ReturnType<typeof getProviders>>[number]["addresses"][number], "id" | "providerId">[]
        ) => void
    }
    let { addresses, locationAutoCompletions = [], onChange = () => {} }: Props = $props()

    function addAddress() {
        addresses.push({
            addressLine1: null,
            addressLine2: null,
            locationType: "unknown",
            city: null,
            state: null,
            zipCode: null,
            contacts: [""],
            location: ""
        })
    }

    $effect(() => onChange(addresses))

    function removeAddress(index: number) {
        if (addresses.length < 2) {
            toaster.error({ title: "Cannot remove the last address." })
            return
        }
        addresses = addresses.filter((_, i) => i !== index)
    }

    function addContact(address: (typeof addresses)[number]) {
        address.contacts.push("")
    }

    function removeContact(address: (typeof addresses)[number], index: number) {
        if (address.contacts.length < 2) {
            toaster.error({ title: "Cannot remove the last contact." })
            return
        }
        address.contacts = address.contacts.filter((_: string, i: number) => i !== index)
    }
</script>

<section class="card p-6 space-y-6 variant-glass-surface">
    <div class="flex items-center justify-between border-b border-surface-300-600-token pb-3">
        <div class="flex items-center gap-3">
            <div class="w-2 h-8 bg-tertiary-500 rounded-full"></div>
            <h3 class="h3 text-tertiary-700-200-token">Service Locations</h3>
        </div>
        <button type="button" class="btn btn-sm preset-filled-primary-500" onclick={addAddress}>
            <span>+</span>
            <span>Add Location</span>
        </button>
    </div>

    <div class="space-y-6">
        {#each addresses as address, address_index}
            <div class="card p-5 space-y-5 variant-soft-surface border-l-4 preset-border-tertiary-500">
                <div class="flex justify-between items-center">
                    <h4 class="h4 text-surface-700-200-token">Location {address_index + 1}</h4>
                    <button
                        type="button"
                        class="btn btn-sm preset-filled-error-500"
                        onclick={() => removeAddress(address_index)}
                    >
                        Remove Location
                    </button>
                </div>

                <div class="space-y-3">
                    <span class="text-sm font-semibold text-surface-700-200-token"
                        >Location Type <span class="text-error-500">*</span></span
                    >
                    <div class="flex flex-col space-y-2">
                        {#each [{ value: "in-person", label: "Physical Location" }, { value: "hybrid", label: "Hybrid" }, { value: "remote", label: "Remote/Virtual Location" }, { value: "unknown", label: "Unknown" }] as option}
                            <label
                                class="flex items-center space-x-3 cursor-pointer p-3 bg-surface-100-800-token rounded-lg"
                            >
                                <input
                                    class="radio"
                                    type="radio"
                                    bind:group={address.locationType}
                                    value={option.value}
                                />
                                <span class="text-sm">{option.label}</span>
                            </label>
                        {/each}
                    </div>
                </div>

                <div transition:slide={{ duration: 200 }} class="grid gap-4">
                    <label class="label">
                        <span class="text-sm font-semibold text-surface-700-200-token"
                            >Location Name <span class="text-error-500">*</span></span
                        >
                        <Combobox
                            data={locationAutoCompletions.map(loc => ({ label: loc, value: loc }))}
                            value={[address.location || ""]}
                            defaultValue={[address.location || ""]}
                            onValueChange={e => (address.location = e.value[0])}
                            label="Select or type a location"
                            placeholder="e.g., Brooklyn, Manhattan"
                            allowCustomValue
                            required
                        />
                    </label>

                    <FormInput
                        label="Address Line 1"
                        required={address.locationType !== "remote"}
                        placeholder="Enter street address"
                        bind:value={address.addressLine1}
                    />

                    <FormInput
                        label="Address Line 2"
                        placeholder="Apt, suite, unit, etc..."
                        bind:value={address.addressLine2}
                    />

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormInput
                            label="City"
                            placeholder="City"
                            required={address.locationType !== "remote"}
                            bind:value={address.city}
                        />
                        <FormInput
                            label="State"
                            placeholder="State"
                            required={address.locationType !== "remote"}
                            bind:value={address.state}
                        />
                        <FormInput
                            label="Zip Code"
                            placeholder="Zip Code"
                            required={address.locationType !== "remote"}
                            bind:value={address.zipCode}
                        />
                    </div>
                </div>

                <!-- Contacts Section -->
                <div class="space-y-4 mt-6">
                    <div class="flex items-center justify-between">
                        <h4 class="h5 text-surface-700-200-token">Contact Information</h4>
                        <button
                            type="button"
                            class="btn btn-sm preset-filled-primary-500"
                            onclick={() => addContact(address)}
                        >
                            <span>+</span>
                            <span>Add Contact</span>
                        </button>
                    </div>

                    <div class="space-y-3">
                        {#if address.contacts}
                            {#each address.contacts as _, contact_index}
                                <div class="flex gap-3 items-center p-4 bg-surface-50-900-token rounded-lg">
                                    <FormInput
                                        label={`Contact ${contact_index + 1}`}
                                        placeholder="Phone, email, website, etc..."
                                        required
                                        bind:value={address.contacts[contact_index]}
                                    />

                                    <button
                                        type="button"
                                        class="btn btn-sm preset-filled-error-500"
                                        onclick={() => removeContact(address, contact_index)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</section>
