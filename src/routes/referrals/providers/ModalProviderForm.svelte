<script lang="ts">
    import { Slider } from "@skeletonlabs/skeleton-svelte"
    import { type ProviderFormData } from "./utils"

    const {
        provider: initialProvider,
        onSubmit
    }: { provider: Partial<ProviderFormData>; onSubmit: (provider: ProviderFormData) => void } = $props()
    let provider = $state({ ...initialProvider })

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
            contacts: null,
            location: ""
        })
    }

    function removeAddress(index: number) {
        if (!provider.addresses) return
        provider.addresses = provider.addresses.filter((_, i) => i !== index)
    }

    function addSubService() {
        if (!provider.subServices) {
            provider.subServices = []
        }
        provider.subServices.push("")
    }
    function removeSubService(index: number) {
        if (!provider.subServices) return
        provider.subServices = provider.subServices.filter((_: any, i: number) => i !== index)
    }

    function addContact(address: NonNullable<typeof provider.addresses>[number]) {
        if (!address.contacts) {
            address.contacts = []
        }
        address.contacts.push("")
    }

    function removeContact(address: NonNullable<typeof provider.addresses>[number], index: number) {
        if (!address.contacts || address.contacts.length < 2) {
            return
        }
        address.contacts = address.contacts.filter((_: string, i: number) => i !== index)
    }

    function localOnSubmit() {
        if (provider.addresses) {
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
        }
        onSubmit(provider as ProviderFormData)
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
                <label class="label">
                    <span class="text-sm font-semibold text-surface-700-200-token"
                        >Provider Name <span class="text-error-500">*</span></span
                    >
                    <input class="input mt-2" required bind:value={provider.name} placeholder="Enter provider name" />
                </label>

                <div class="space-y-4">
                    <label class="flex items-center space-x-3 cursor-pointer">
                        <input class="checkbox" type="checkbox" bind:checked={provider.acceptsInsurance} />
                        <span class="text-sm font-semibold text-surface-700-200-token">Accepts Insurance</span>
                    </label>

                    {#if provider.acceptsInsurance}
                        <div class="ml-6 transition-all duration-200">
                            <label class="label">
                                <span class="text-sm text-surface-600-400-token">Insurance Details</span>
                                <input
                                    class="input mt-2"
                                    placeholder="Enter accepted insurance types, coverage details, etc."
                                    bind:value={provider.insuranceDetails}
                                />
                            </label>
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
                    <input
                        class="input mt-2"
                        bind:value={provider.serviceType}
                        placeholder="e.g., Mental Health, Physical Therapy, etc."
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
                                <div class="grid gap-4">
                                    <label class="label">
                                        <span class="text-sm font-semibold text-surface-700-200-token"
                                            >Location Name <span class="text-error-500">*</span></span
                                        >
                                        <input
                                            class="input mt-2"
                                            bind:value={address.location}
                                            placeholder="e.g., Main Office, Downtown Branch"
                                        />
                                    </label>

                                    <label class="label">
                                        <span class="text-sm font-semibold text-surface-700-200-token"
                                            >Street Address <span class="text-error-500">*</span></span
                                        >
                                        <input
                                            class="input mt-2"
                                            required
                                            bind:value={address.addressLine1}
                                            placeholder="Enter street address"
                                        />
                                    </label>

                                    <label class="label">
                                        <span class="text-sm text-surface-600-400-token">Address Line 2</span>
                                        <input
                                            class="input mt-2"
                                            bind:value={address.addressLine2}
                                            placeholder="Apt, suite, unit, etc. (optional)"
                                        />
                                    </label>

                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <label class="label md:col-span-1">
                                            <span class="text-sm font-semibold text-surface-700-200-token"
                                                >City <span class="text-error-500">*</span></span
                                            >
                                            <input
                                                class="input mt-2"
                                                required
                                                bind:value={address.city}
                                                placeholder="City"
                                            />
                                        </label>
                                        <label class="label">
                                            <span class="text-sm font-semibold text-surface-700-200-token"
                                                >State <span class="text-error-500">*</span></span
                                            >
                                            <input
                                                class="input mt-2"
                                                required
                                                bind:value={address.state}
                                                placeholder="State"
                                            />
                                        </label>
                                        <label class="label">
                                            <span class="text-sm font-semibold text-surface-700-200-token"
                                                >ZIP Code <span class="text-error-500">*</span></span
                                            >
                                            <input
                                                class="input mt-2"
                                                required
                                                bind:value={address.zipCode}
                                                placeholder="ZIP"
                                            />
                                        </label>
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
                                            <div
                                                class="flex gap-3 items-center p-4 bg-surface-50-900-token rounded-lg border border-surface-200-700-token"
                                            >
                                                <div class="flex-1">
                                                    <label class="label">
                                                        <span class="text-xs text-surface-600-400-token"
                                                            >Contact {contact_index + 1}</span
                                                        >
                                                        <input
                                                            class="input mt-1"
                                                            bind:value={address.contacts[contact_index]}
                                                            placeholder="Phone, email, website, etc."
                                                        />
                                                    </label>
                                                </div>
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
