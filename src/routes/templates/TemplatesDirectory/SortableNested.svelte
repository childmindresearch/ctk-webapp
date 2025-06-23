<script lang="ts">
    import { shortenText } from "$lib/utils"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import SortableNestedNode from "./SortableNestedNode.svelte"
    import Sortable, { type SortableEvent } from "sortablejs"
    import { Modal } from "@skeletonlabs/skeleton-svelte"

    type Props = {
        node: DecisionTree
        onAddToCart: (node: DecisionTree) => void
        editable?: boolean
    }
    let { node, onAddToCart, editable = true }: Props = $props()
    let isModalOpen = $state(false)

    let movedNode = $state(node)
    let targetParentNode: DecisionTree | null = $state(node)
    let lastEvent: Sortable.SortableEvent | undefined = undefined

    function modalClose() {
        isModalOpen = false
    }

    //TODO: Clean up the onDrag / onMove interaction.
    async function onDrag(event: Sortable.SortableEvent) {
        if (event.oldIndex === undefined) return
        if (event.newIndex === undefined) return

        const targetId = parseInt(event.to.id.split("-")[1])
        const sourceId = parseInt(event.from.id.split("-")[1])

        if (targetId === sourceId && event.oldIndex === event.newIndex) return

        const sourceParentNode = node.getNodeById(sourceId)
        targetParentNode = node.getNodeById(targetId)
        if (!sourceParentNode || !targetParentNode) return
        movedNode = sourceParentNode.children[event.oldIndex]
        lastEvent = event
        isModalOpen = true
    }

    async function onMove() {
        if (!lastEvent) return

        const targetId = parseInt(lastEvent.to.id.split("-")[1])
        const sourceId = parseInt(lastEvent.from.id.split("-")[1])
        const sourceParentNode = node.getNodeById(sourceId) as DecisionTree

        await fetch(`/api/templates/${movedNode.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: movedNode.text,
                parentId: (targetParentNode as DecisionTree).id,
                priority: lastEvent.newIndex
            })
        }).then(response => {
            if (!response.ok) return
            if (sourceId === targetId) {
                // @ts-expect-error Typescript doesn't detect that newIndex cannot be undefined.
                targetParentNode.moveChild(movedNode.id, lastEvent.newIndex)
            } else {
                sourceParentNode.deleteChild(movedNode.id)
                ;(targetParentNode as DecisionTree).addChild(movedNode, (lastEvent as SortableEvent).newIndex)
            }
        })
    }
</script>

{#if targetParentNode !== null}
    <Modal
        open={isModalOpen}
        onOpenChange={e => (isModalOpen = e.open)}
        triggerBase="btn preset-tonal"
        contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl max-w-screen-sm"
        backdropClasses="backdrop-blur-sm"
    >
        {#snippet content()}
            <header>Move template</header>
            <article>
                Are you sure you want to move {shortenText(movedNode.text)} to {shortenText(
                    (targetParentNode as DecisionTree).text
                )}?
            </article>
            <footer class="flex justify-end gap-4">
                <button type="button" class="btn preset-tonal" onclick={modalClose}>Cancel</button>
                <button type="button" class="btn preset-filled" onclick={onMove}>Move</button>
            </footer>
        {/snippet}
    </Modal>
{/if}

<SortableNestedNode {node} {editable} _isRoot={true} {onAddToCart} {onDrag} />
