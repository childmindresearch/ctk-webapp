<script lang="ts">
    import DataTable from "$lib/components/DataTable.svelte"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { unpackProviders } from "../utils.js"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"

    let { data } = $props()

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    let providers = $state(data.data)
    let unpackedProviders = $derived(providers.map(unpackProviders))
    let loading = $state(false)

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
            body: `Are you sure you wish to delete "${row.Name}"?`,
            response: async response => {
                if (!response) return
                await fetch(`/api/referrals/providers/${row.id}`, { method: "DELETE" }).then(response => {
                    if (response.ok) {
                        providers = providers.filter(prov => prov.id !== Number(row.id))
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
</script>

<div class="z-0">
    {#if providers.length > 0}
        <DataTable data={unpackedProviders} {onCreate} {onDelete} idColumn="id" hiddenColumns={["id"]} />
    {:else}
        <p>No providers found.</p>
        <button onclick={onCreate} class="btn variant-filled-secondary">
            <span>Create</span>
        </button>
    {/if}
</div>
<LoadingBar hidden={!loading} />
