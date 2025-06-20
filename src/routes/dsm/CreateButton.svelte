<script lang="ts">
    import ModalDsmForm from "./ModalDsmForm.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"

    type Props = { onCreate: (code: string, label: string) => void }
    let { onCreate }: Props = $props()
    let isModalOpen = $state(false)

    const instructions = "Create a new DSM code."
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase="btn preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <span class="btn">Create DSM Code</span>
    {/snippet}
    {#snippet content()}
        <ModalDsmForm code="" label="" onSubmit={onCreate} {instructions} />
    {/snippet}
</Modal>
