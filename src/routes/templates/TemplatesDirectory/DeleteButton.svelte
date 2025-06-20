<script lang="ts">
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import { shortenText } from "$lib/utils"
    import { DecisionTree } from "../DecisionTree.svelte"
    import { openNodeIds } from "./store"
    import { toaster } from "$lib/utils"
    import { Modal } from "@skeletonlabs/skeleton-svelte"

    type Props = {
        node: DecisionTree
        ondelete?: () => void
    }
    let { node }: Props = $props()

    let isModalOpen = $state(false)

    function modalClose() {
        isModalOpen = false
    }

    async function onDelete() {
        await fetch(`/api/templates/${node.id}`, { method: "DELETE" }).then(response => {
            if (!response.ok) {
                toaster.error({
                    title: "Failed to delete the template: " + response.statusText
                })
            } else if (!node.parent) {
                toaster.error({
                    title: "Cannot delete the root node."
                })
            } else {
                const parent = node.parent
                openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
                parent.deleteChild(node.id)
            }
        })
        modalClose()
    }
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase="btn hover:preset-tonal"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <TrashIcon class="text-error-600" />
    {/snippet}
    {#snippet content()}
        <header>Delete node</header>
        <article>Are you sure you wish to delete node {shortenText(node.text)}?</article>
        <footer class="flex justify-end gap-4">
            <button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
            <button type="button" class="btn preset-filled" onclick={onDelete}>Delete</button>
        </footer>
    {/snippet}
</Modal>
