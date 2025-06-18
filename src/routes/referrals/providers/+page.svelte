<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import MultiSelectFilter from "$lib/components/DataTable/MultiSelectFilter.svelte"
    import type { GetSingleProviderResponse } from "$lib/types.js"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { downloadBlob } from "$lib/utils.js"

    let { data } = $props()

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    let providers = $state(data.data.map(unpackProviders))
    let isLoading = $state(false)
    type columnNames = keyof (typeof providers)[number]

    const filters: columnNames[] = ["acceptsInsurance", "location", "serviceType"]
    const documentColumns: columnNames[] = ["name", "location", "acceptsInsurance"]
    const hiddenColumns: columnNames[] = ["id", "insuranceDetails", "minAge", "maxAge", "address"]

    let columnFilters: Partial<Record<columnNames, string>> = $state({})
    let participantAge: number | null = $state(null)
    function filterProviders(age: number | null, filters: typeof columnFilters) {
        let filtered = providers

        if (age !== null) {
            filtered = filtered.filter(provider => {
                const { minAge, maxAge } = provider
                if (minAge === null && maxAge === null) return true
                const meetsMinAge = minAge === null || age >= minAge
                const meetsMaxAge = maxAge === null || age <= maxAge
                return meetsMinAge && meetsMaxAge
            })
        }

        if (Object.keys(filters).length > 0) {
            filtered = filtered.filter(provider => {
                return Object.entries(filters).every(([column, filterValue]) => {
                    if (!filterValue || !filterValue.trim()) return true
                    const cellValue = String(provider[column as keyof (typeof providers)[number]]).toLowerCase()
                    const filterValues = filterValue.split(",").map(v => v.trim().toLowerCase())
                    return filterValues.some(filterVal => cellValue.includes(filterVal))
                })
            })
        }

        return filtered
    }

    let unpackedProviders = $derived(filterProviders(participantAge, columnFilters))

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
                        providers = providers.filter(prov => prov.id !== row.id)
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
        const baseProvider = data.data.find(prov => prov.id === Number(row.id))
        const modal: ModalSettings = {
            type: "component",
            component: "modalProvider",
            title: "Update Provider",
            meta: {
                name: row.name,
                acceptsInsurance: row.acceptsInsurance,
                insuranceDetails: row.insuranceDetails,
                minAge: baseProvider?.minAge,
                maxAge: baseProvider?.maxAge,
                addresses: baseProvider?.addresses ?? []
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
                        const oldProvider = providers.findIndex(prov => prov.id === row.id)
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

    async function onExport() {
        const body = [
            documentColumns,
            ...unpackedProviders.map(provider => {
                return documentColumns.map(col => String(provider[col]))
            })
        ]
        await fetch("/api/referrals/document", { method: "POST", body: JSON.stringify(body) })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text())
                }
                return await response.blob()
            })
            .then(blob => {
                const filename = `referral_CTK.docx`
                downloadBlob(blob, filename)
            })
            .catch(error => {
                toastStore.trigger({
                    background: "variant-filled-error",
                    message: error.message
                })
                isLoading = false
            })
            .finally(() => {
                isLoading = false
            })
    }

    function unpackProviders(row: GetSingleProviderResponse) {
        return {
            id: String(row.id),
            name: row.name,
            acceptsInsurance: row.acceptsInsurance,
            insuranceDetails: row.insuranceDetails,
            minAge: row.minAge,
            maxAge: row.maxAge,
            location: concatenateTruthyUnique(row.addresses.map(addr => addr.location)),
            serviceType: row.serviceType,
            subServices: concatenateTruthyUnique(row.subServices.map(s => s.name)),
            address: row.addresses
                .map(addr => {
                    if (addr.isRemote) return "Remote"
                    return [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode, addr.state]
                        .filter(value => value !== null)
                        .join(", ")
                })
                .join("\n")
        }
    }

    function concatenateTruthyUnique(arr: Array<string | null>, join: string = ", ") {
        return arr
            .filter(val => val)
            .filter(onlyUnique)
            .join(join)
    }

    function onlyUnique<T>(value: T, index: number, array: Array<T>) {
        return array.indexOf(value) === index
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

        {#each filters as filter}
            <MultiSelectFilter
                options={providers.map(p => String(p[filter])).filter(onlyUnique)}
                name={filter}
                onChange={s => (columnFilters[filter] = s.join(", "))}
            />
        {/each}

        <button class="btn variant-filled-primary" onclick={onExport}> Export </button>

        <DataTable data={unpackedProviders} {onCreate} {onDelete} {onEdit} idColumn="id" {hiddenColumns} />
    {:else}
        <p>No providers found.</p>
        <button onclick={onCreate} class="btn variant-filled-secondary">
            <span>Create</span>
        </button>
    {/if}
</div>
