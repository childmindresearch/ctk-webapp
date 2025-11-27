<script lang="ts">
    import ModalDsmForm from "./ModalDsmForm.svelte"
    import * as Dialog from "$lib/components/ui/dialog"
    import { Button } from "$lib/components/ui/button"

    type Props = { onCreate: (code: string, label: string) => void }
    let { onCreate }: Props = $props()

    let isModalOpen = $state(false)
    const instructions = "Create a new DSM code."

    function localOnCreate(code: string, label: string) {
        onCreate(code, label)
        isModalOpen = false
    }
</script>

<Dialog.Root bind:open={isModalOpen}>
    <Dialog.Trigger>
        <Button>Create DSM Code</Button>
    </Dialog.Trigger>
    <Dialog.Content class="max-w-[48rem]">
        <ModalDsmForm code="" label="" onSubmit={localOnCreate} {instructions} />
    </Dialog.Content>
</Dialog.Root>
