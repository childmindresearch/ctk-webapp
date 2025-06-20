<script lang="ts">
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import { toaster } from "$lib/utils"
    import { Modal } from "@skeletonlabs/skeleton-svelte"

    type Props = {
        dsmItem: { label: string; code: string; id: number }
        onDelete: (item: SqlDsmCodeSchema) => void
    }
    const { dsmItem, onDelete }: Props = $props()
    let isModalOpen = $state(false)

    function modalClose() {
        isModalOpen = false
    }

    async function localOnDelete() {
        await fetch(`/api/dsm/${dsmItem.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        }).then(result => {
            if (!result.ok) {
                toaster.error({
                    title: `Failed to edit the DSM code: ${result.statusText}`
                })
            } else {
                onDelete(dsmItem)
                toaster.success({
                    title: `Deleted the DSM code.`
                })
            }
        })
        onDelete(dsmItem)
        modalClose()
    }
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <TrashIcon class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem] text-error-600" />
    {/snippet}
    {#snippet content()}
        <header>Delete DSM code</header>
        <article>Are you sure you wish to delete DSM Code {dsmItem.code + " " + dsmItem.label}?</article>
        <footer class="flex justify-end gap-4">
            <button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
            <button type="button" class="btn preset-filled" onclick={localOnDelete}>Delete</button>
        </footer>
    {/snippet}
</Modal>
