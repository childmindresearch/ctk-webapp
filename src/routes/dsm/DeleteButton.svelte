<script lang="ts">
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"

    export let dsmItem: { label: string; code: string; id: number }
    export let onDelete: (item: SqlDsmCodeSchema) => void

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    async function onClick() {
        const modal: ModalSettings = {
            type: "confirm",
            title: `Delete DSM Code`,
            body: `Are you sure you wish to delete "${dsmItem.label}"?`,
            response: async response => {
                if (!response) return
                await fetch(`/api/dsm/${dsmItem.id}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                }).then(result => {
                    if (!result.ok) {
                        toastStore.trigger({
                            message: `Failed to edit the DSM code: ${result.statusText}`,
                            background: "variant-filled-error"
                        })
                    } else {
                        onDelete(dsmItem)
                        toastStore.trigger({
                            message: `Deleted the DSM code.`,
                            background: "variant-filled-success"
                        })
                    }
                })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<button on:click={onClick} class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem]">
    <TrashIcon class="text-error-600" />
</button>
