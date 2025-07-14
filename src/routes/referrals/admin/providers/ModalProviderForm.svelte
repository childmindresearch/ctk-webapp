<script lang="ts">
    import { Slider } from "@skeletonlabs/skeleton-svelte"
    import { Combobox } from "@skeletonlabs/skeleton-svelte"
    import { type ProviderFormData } from "./utils"
    import { isUnique } from "$lib/utils"
    import FormInput from "$lib/components/FormInput.svelte"
    import { toaster } from "$lib/utils"
    import { slide } from "svelte/transition"
    import { createProviderSchema } from "$api/referrals/providers/schemas"
    import { z } from "zod"

    type Props = {
        provider: Partial<ProviderFormData>
        onSubmit: (provider: z.infer<typeof createProviderSchema>) => void
        serviceAutoCompletions?: string[]
        locationAutoCompletions?: string[]
        subServiceAutoCompletions?: string[]
    }
    let {
        provider: initialProvider,
        onSubmit,
        serviceAutoCompletions = [],
        locationAutoCompletions = [],
        subServiceAutoCompletions = []
    }: Props = $props()
    let provider = $state({
        name: "",
        acceptsInsurance: false,
        minAge: 0,
        maxAge: 120,
        addresses: [],
        service: { name: "" },
        subServices: [],
        ...initialProvider
    })
    const serviceCompletions = serviceAutoCompletions.filter(isUnique).map(s => {
        return { label: s, value: s }
    })

    $effect(() => {
        if (!provider.acceptsInsurance) {
            provider.insuranceDetails = ""
        }
    })

    function addAddress() {
        if (!provider.addresses) {
            provider.addresses = []
        }
        provider.addresses.push({
            addressLine1: null,
            addressLine2: null,
            isRemote: false,
            city: null,
            state: null,
            zipCode: null,
            contacts: [""],
            location: ""
        })
    }

    if (!provider.addresses) {
        addAddress()
    }

    function removeAddress(index: number) {
        if (!provider.addresses || provider.addresses.length < 2) {
            toaster.error({ title: "Cannot remove the last address." })
            return
        }
        provider.addresses = provider.addresses.filter((_, i) => i !== index)
    }

    function addSubService() {
        provider.subServices.push({ id: undefined, name: "" })
    }
    function removeSubService(index: number) {
        provider.subServices = provider.subServices.filter((_: any, i: number) => i !== index)
    }

    function addContact(address: (typeof provider.addresses)[number]) {
        address.contacts.push("")
    }

    function removeContact(address: (typeof provider.addresses)[number], index: number) {
        if (address.contacts.length < 2) {
            toaster.error({ title: "Cannot remove the last contact." })
            return
        }
        address.contacts = address.contacts.filter((_: string, i: number) => i !== index)
    }

    function localOnSubmit() {
        for (let address of provider.addresses) {
            if (!address.isRemote) {
                if (!address.addressLine1 || !address.city || !address.state || !address.zipCode) {
                    alert("Please fill in all required address fields.")
                    return
                }
            } else {
                address.location = "Remote"
                address.addressLine1 = null
                address.addressLine2 = null
                address.city = null
                address.state = null
                address.zipCode = null
            }
        }

        const data = {
            ...provider,
            insuranceDetails: "",
            service: provider.service.name,
            subServices: provider.subServices.map(s => s.name)
        }

        onSubmit(data)
    }
</script>

<div class="max-w-4xl mx-auto p-6">
    <form onsubmit={localOnSubmit} class="overflow-y-auto max-h-[95vh]">
        <!-- Provider Section -->
        <section class="card p-6 space-y-6 variant-glass-surface">
            <div class="flex items-center gap-3 border-b border-surface-300-600-token pb-3">
                <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
                <h3 class="h3 text-primary-700-200-token">Provider Information</h3>
            </div>

            <div class="grid gap-6">
                <FormInput
                    label="Provider Name"
                    required
                    placeholder="Enter provider name"
                    bind:value={provider.name}
                />

                <div class="space-y-4">
                    <label class="flex items-center space-x-3 cursor-pointer">
                        <input class="checkbox" type="checkbox" bind:checked={provider.acceptsInsurance} />
                        <span class="text-sm font-semibold text-surface-700-200-token">Accepts Insurance</span>
                    </label>

                    {#if provider.acceptsInsurance}
                        <div transition:slide={{ duration: 200 }}>
                            <FormInput
                                label="Insurance Details"
                                required
                                bind:value={provider.insuranceDetails}
                                placeholder="Enter accepted insurance types, coverage details, etc."
                                labelClass="ml-6"
                            />
                        </div>
                    {/if}
                </div>
            </div>
        </section>

        <!-- Services Section -->
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
                        value={[provider.service.name || ""]}
                        defaultValue={[provider.service.name || ""]}
                        onValueChange={e => (provider.service = { name: e.value[0] })}
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
                        {#if provider.subServices}
                            {#each provider.subServices as _, subservice_index}
                                <div class="flex gap-3 items-center p-3 bg-surface-100-800-token rounded-lg">
                                    <input
                                        class="input flex-1"
                                        bind:value={provider.subServices[subservice_index]}
                                        placeholder="Enter subspecialty or specific service"
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
                        {/if}
                    </div>
                </div>

                <label class="label">
                    <span class="text-sm font-semibold text-surface-700-200-token"
                        >Age Range: {provider.minAge || 0}-{provider.maxAge || 120}</span
                    >
                    <div class="text-sm">
                        Note: Age range is inclusive on both sides i.e. "only minors" would be "0-17".
                    </div>
                    <Slider
                        min={0}
                        max={120}
                        step={1}
                        value={[provider.minAge || 0, provider.maxAge || 120]}
                        onValueChange={e => {
                            provider.minAge = e.value[0]
                            provider.maxAge = e.value[1]
                        }}
                    />
                </label>
            </div>
        </section>

        <!-- Addresses Section -->
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
                {#if provider.addresses}
                    {#each provider.addresses as address, address_index}
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

                            <label
                                class="flex items-center space-x-3 cursor-pointer p-3 bg-surface-100-800-token rounded-lg"
                            >
                                <input class="checkbox" type="checkbox" bind:checked={address.isRemote} />
                                <span class="text-sm font-semibold">This is a remote/virtual location</span>
                            </label>

                            {#if !address.isRemote}
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
                                        required
                                        placeholder="Enter street address"
                                        bind:value={address.addressLine1}
                                    />

                                    <FormInput
                                        label="Address Line 2"
                                        placeholder="Apt, suite, unit, etc..."
                                        bind:value={address.addressLine2}
                                    />

                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormInput label="City" placeholder="City" required bind:value={address.city} />
                                        <FormInput
                                            label="State"
                                            placeholder="State"
                                            required
                                            bind:value={address.state}
                                        />
                                        <FormInput
                                            label="Zip Code"
                                            placeholder="Zip Code"
                                            required
                                            bind:value={address.zipCode}
                                        />
                                    </div>
                                </div>
                            {/if}

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
                {/if}
            </div>
        </section>

        <!-- Submit Section -->
        <div class="flex justify-end pt-6 border-t border-surface-300-600-token">
            <button class="btn preset-filled-secondary-500 text-md" type="submit"> Submit </button>
        </div>
    </form>
</div>
