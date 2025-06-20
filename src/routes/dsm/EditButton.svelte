<script lang="ts">
    import EditIcon from "$lib/icons/EditIcon.svelte"
    import ModalDsmForm from "./ModalDsmForm.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"

    type Props = {
        dsmItem: { label: string; code: string; id: number }
        onEdit: (code: string, label: string, id?: number) => void
    }

    let { dsmItem, onEdit }: Props = $props()
    let isModalOpen = $state(false)
    const instructions = "Edit the DSM code."
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <EditIcon class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem] text-warning-600" />
    {/snippet}
    {#snippet content()}
        <ModalDsmForm {...dsmItem} onSubmit={onEdit} {instructions} />
    {/snippet}
</Modal>
