<script lang="ts">
    import DataTable from "$lib/components/DataTable.svelte"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { unpackProviders } from "../../utils.js"

    let { data } = $props()

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    let providers = $state(data.data)
    let loading = $state(false)

    async function onCreate() {
        return await new Promise<(typeof providers)[number]>(resolve => {
            const modal: ModalSettings = {
                type: "component",
                component: "createProvider",
                title: `Create Referral`,
                response: response => {
                    if (!response) return
                    resolve(response)
                }
            }
            modalStore.trigger(modal)
        })
            .then(async response => {
                return await fetch("/api/referrals/providers", {
                    method: "POST",
                    body: JSON.stringify(response)
                })
            })
            .then(async response => {
                if (!response.ok) throw await response.text()
                providers.push(await response.json())
            })
            .catch(reason => {
                toastStore.trigger({
                    message: `Could not create: ${reason}.`,
                    background: "bg-error-500"
                })
            })
    }

    async function onEdit(row: { id: number }) {
        return await new Promise<typeof row>(resolve => {
            const modal: ModalSettings = {
                type: "component",
                component: "createProvider",
                meta: row,
                response: response => {
                    if (!response) return
                    resolve(response)
                }
            }
            modalStore.trigger(modal)
        })
            .then(async formData => {
                const response = await fetch(`/api/referrals/providers/${row.id}`, {
                    method: "PUT",
                    body: JSON.stringify(formData)
                })
                const index = providers.findIndex(tableRow => tableRow.id === row.id)
                if (index === -1) return
                providers[index] = await response.json()
            })
            .catch(reason => {
                toastStore.trigger({
                    message: `Could not edit: ${reason}.`,
                    background: "bg-error-500"
                })
            })
    }

    async function onDelete(row: { id: number; name: string }) {
        const modal: ModalSettings = {
            type: "confirm",
            title: "Delete Referral",
            body: `Are you sure you wish to delete ${row.name}?`,
            response: async (response: boolean) => {
                if (!response) return
                await fetch(`/api/referrals/providers/${row.id}`, {
                    method: "DELETE"
                })
                    .then(async response => {
                        if (!response.ok) throw await response.text()
                        providers = providers.filter(tableRow => tableRow.id !== row.id)
                    })
                    .catch(reason => {
                        toastStore.trigger({
                            message: `Could not delete: ${reason}.`,
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
        <DataTable data={providers} {onCreate} {onEdit} {onDelete} unpack={unpackProviders} hiddenColumns={["id"]} />
    {:else}
        <p>Error: No providers found.</p>
    {/if}
</div>
<LoadingBar hidden={!loading} />
