<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import type { GetProviderResponse } from "$lib/types.js"
    import { unpackProviders } from "../utils.js"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"

    let { data } = $props()

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    let providers = $state(data.data)

    let participantAge: number | null = $state(null)
    function filterProviders(age: number | null): GetProviderResponse {
        if (age === null) return providers

        return providers.filter(provider => {
            const { minAge, maxAge } = provider
            console.log(`Filtering provider ${provider.name} for age ${age} with minAge ${minAge} and maxAge ${maxAge}`)

            if (minAge === null && maxAge === null) return true

            const meetsMinAge = minAge === null || (age as number) >= minAge
            const meetsMaxAge = maxAge === null || (age as number) <= maxAge

            console.log(`Provider ${provider.name} meetsMinAge: ${meetsMinAge}, meetsMaxAge: ${meetsMaxAge}`)

            return meetsMinAge && meetsMaxAge
        })
    }
    let unpackedProviders = $derived(filterProviders(participantAge).map(unpackProviders))

    async function onCreate() {
        const modal: ModalSettings = {
            type: "component",
            component: "modalProvider",
            title: `Create Provider`,
            response: async response => {
                if (!response) return
                return await fetch("/api/referrals/providers", {
                    method: "POST",
                    body: JSON.stringify(response)
                })
                    .then(async response => {
                        if (!response.ok) throw await response.text()
                        const newProvider = await response.json()
                        providers.push(newProvider)
                        toastStore.trigger({
                            message: `Created provider.`,
                            background: "bg-success-500"
                        })
                    })
                    .catch(reason => {
                        toastStore.trigger({
                            message: `Could not create: ${reason}.`,
                            background: "bg-error-500"
                        })
                    })
            }
        }
        modalStore.trigger(modal)
    }

    async function onDelete(row: ReturnType<typeof unpackProviders>) {
        const modal: ModalSettings = {
            type: "confirm",
            title: `Delete DSM Code`,
            body: `Are you sure you wish to delete "${row.name}"?`,
            response: async response => {
                if (!response) return
                await fetch(`/api/referrals/providers/${row.id}`, { method: "DELETE" }).then(response => {
                    if (response.ok) {
                        providers = providers.filter(prov => prov.id !== Number(row.id))
                        toastStore.trigger({
                            message: `Deleted provider.`,
                            background: "bg-success-500"
                        })
                    } else {
                        toastStore.trigger({
                            message: "Could not delete provider",
                            background: "variant-filled-error"
                        })
                    }
                })
            }
        }
        modalStore.trigger(modal)
    }

    async function onEdit(row: ReturnType<typeof unpackProviders>) {
        const provider = providers.find(prov => prov.id === Number(row.id))
        const modal: ModalSettings = {
            type: "component",
            component: "modalProvider",
            title: "Update Provider",
            meta: {
                name: row.name,
                acceptsInsurance: row.acceptsInsurance,
                insuranceDetails: row.insuranceDetails,
                minAge: provider?.minAge,
                maxAge: provider?.maxAge,
                addresses: provider?.addresses ?? []
            },
            response: async response => {
                if (!response) return
                return await fetch(`/api/referrals/providers/${row.id}`, {
                    method: "PUT",
                    body: JSON.stringify(response)
                })
                    .then(async response => {
                        if (!response.ok) throw await response.text()
                        const newProvider = await response.json()
                        const oldProvider = providers.findIndex(prov => prov.id === Number(row.id))
                        if (oldProvider !== -1) {
                            providers[oldProvider] = newProvider
                        }
                        toastStore.trigger({
                            message: `Updated provider.`,
                            background: "bg-success-500"
                        })
                    })
                    .catch(reason => {
                        toastStore.trigger({
                            message: `Could not create: ${reason}.`,
                            background: "bg-error-500"
                        })
                    })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<div class="z-0">
    {#if providers.length > 0}
        <div class="mb-4 p-4 border rounded-lg bg-surface-50">
            <label class="block text-sm font-medium mb-2" for="participant-age"> Filter by Age: </label>
            <div class="flex items-center gap-2">
                <input
                    id="participant-age"
                    class="input w-32"
                    type="number"
                    min="0"
                    max="120"
                    bind:value={participantAge}
                    placeholder="Enter age"
                />
            </div>
        </div>

        {#key unpackedProviders}
            <DataTable
                data={unpackedProviders}
                {onCreate}
                {onDelete}
                {onEdit}
                idColumn="id"
                columnsWithFilters={["location", "acceptsInsurance"]}
                hiddenColumns={["id", "insuranceDetails"]}
            />
        {/key}
    {:else}
        <p>No providers found.</p>
        <button onclick={onCreate} class="btn variant-filled-secondary">
            <span>Create</span>
        </button>
    {/if}
</div>
