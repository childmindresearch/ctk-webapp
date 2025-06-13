<script lang="ts">
    import { getModalStore } from "@skeletonlabs/skeleton"

    const modalStore = getModalStore()

    let name: string = $state($modalStore[0].meta?.name ?? "")

    let addresses: {
        addressLine1?: string
        addressLine2?: string
        isRemote?: boolean
        city?: string
        state?: string
        zipCode?: string
        contacts?: string[]
        location?: string
    }[] = $state($modalStore[0].meta?.addresses ? [...$modalStore[0].meta?.addresses] : [{}])

    function addAddress() {
        addresses.push({})
    }

    function removeAddress(index: number) {
        addresses = addresses.filter((_, i) => i !== index)
    }

    function addContact(address: (typeof addresses)[number]) {
        if (!address.contacts) {
            address.contacts = []
        }
        address.contacts.push("")
    }

    function removeContact(address: (typeof addresses)[number], index: number) {
        if (!address.contacts) {
            return
        }
        address.contacts = address.contacts.filter((_, i) => i !== index)
    }

    function onSubmit() {
        for (let address of addresses) {
            if (!address.isRemote) {
                if (!address.addressLine1 || !address.city || !address.state || !address.zipCode) {
                    alert("Please fill in all required address fields.")
                    return
                }
            } else {
                address.addressLine1 = undefined
                address.city = undefined
                address.state = undefined
                address.zipCode = undefined
            }
        }
        if ($modalStore[0].response) {
            $modalStore[0].response({
                name: name,
                addresses: addresses.length > 0 ? addresses : undefined
            })
            modalStore.close()
        }
    }
</script>

{#if $modalStore[0]}
    <div class="card fixed p-12 rounded-3xl w-modal-wide space-y-4 max-h-[70vh] overflow-y-auto">
        <form onsubmit={onSubmit} class="space-y-2">
            <!-- Provider Section -->
            <label class="label">
                <span>Provider Name*</span>
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

                {#each addresses as address, address_index}
                    <div class="card p-4 space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold">Address {address_index + 1}</span>
                            <button
                                type="button"
                                class="btn btn-sm variant-ghost-error"
                                onclick={() => removeAddress(address_index)}
                            >
                                Remove
                            </button>
                        </div>

                        <label class="label">
                            <input class="checkbox" type="checkbox" bind:checked={address.isRemote} />
                            <span> Remote </span>
                        </label>

                        {#if !address.isRemote}
                            <label class="label">
                                <span>Location</span>
                                <input class="input" required bind:value={address.location} />
                            </label>

                            <label class="label">
                                <span>Address Line 1*</span>
                                <input class="input" required bind:value={address.addressLine1} />
                            </label>

                            <label class="label">
                                <span>Address Line 2</span>
                                <input class="input" bind:value={address.addressLine2} />
                            </label>

                            <div class="grid grid-cols-2 gap-2">
                                <label class="label">
                                    <span>City*</span>
                                    <input class="input" required bind:value={address.city} />
                                </label>

                                <label class="label">
                                    <span>State*</span>
                                    <input class="input" required bind:value={address.state} />
                                </label>
                            </div>

                            <label class="label">
                                <span>ZIP Code*</span>
                                <input class="input" required bind:value={address.zipCode} />
                            </label>
                        {/if}

                        <!-- Contacts Section -->
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="h4">Contacts</h3>
                                <button
                                    type="button"
                                    class="btn btn-sm variant-ghost-primary"
                                    onclick={() => addContact(address)}
                                >
                                    Add Contact
                                </button>
                            </div>

                            {#if address.contacts}
                                {#each address.contacts as contact, contact_index}
                                    <div class="card p-4 space-y-2">
                                        <div class="flex justify-between items-center">
                                            <span class="font-semibold">Contact {contact_index + 1}</span>
                                            <button
                                                type="button"
                                                class="btn btn-sm variant-ghost-error"
                                                onclick={() => removeContact(address, contact_index)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div class="card p-4 space-y-2">
                                            <label class="label">
                                                <span>Contact Details (e.g. email, phone number, website)</span>
                                                <input class="input" bind:value={address.contacts[contact_index]} />
                                            </label>
                                        </div>
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
            <button class="btn variant-filled-primary" type="submit"> Submit </button>
        </form>
    </div>
{/if}
