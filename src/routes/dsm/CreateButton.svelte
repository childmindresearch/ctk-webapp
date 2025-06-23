<script lang="ts">
    import ModalDsmForm from "./ModalDsmForm.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"

    type Props = { onCreate: (code: string, label: string) => void }
    let { onCreate }: Props = $props()
    let isModalOpen = $state(false)

    const instructions = "Create a new DSM code."

    function localOnCreate(code: string, label: string) {
        onCreate(code, label)
        isModalOpen = false
    }
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase="btn"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[48rem] max-w-[90vw]"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <span class="btn preset-filled-primary-500">Create DSM Code</span>
    {/snippet}
    {#snippet content()}
        <ModalDsmForm code="" label="" onSubmit={localOnCreate} {instructions} />
    {/snippet}
</Modal>
