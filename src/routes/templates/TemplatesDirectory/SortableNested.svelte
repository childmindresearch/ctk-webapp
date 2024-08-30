<script lang="ts">
    import { shortenText } from "$lib/utils"
    import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "../DecisionTree"
    import SortableNestedNode from "./SortableNestedNode.svelte"

    export let node: DecisionTree
    export let editable = true

    const modalStore = getModalStore()

    async function onDrag(event: CustomEvent) {
        const targetId = parseInt(event.detail.to.id.split("-")[1])
        const sourceId = parseInt(event.detail.from.id.split("-")[1])

        if (targetId === sourceId && event.detail.oldIndex === event.detail.newIndex) return

        const sourceParentNode = node.getNodeById(sourceId)
        const targetParentNode = node.getNodeById(targetId)
        if (!sourceParentNode || !targetParentNode) return
        const movedNode = sourceParentNode.children[event.detail.oldIndex]

        if (!sourceParentNode || !targetParentNode) return
        const modal: ModalSettings = {
            type: "confirm",
            title: "Move template",
            body: `Are you sure you want to move "${shortenText(movedNode.text)}" to "${shortenText(
                targetParentNode.text
            )}"?`,
            response: async confirmed => {
                if (confirmed) {
                    await fetch(`/api/templates/${movedNode.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: movedNode.text,
                            parentId: targetParentNode.id,
                            priority: event.detail.newIndex
                        })
                    }).then(response => {
                        if (!response.ok) {
                            const items = event.detail.from.querySelectorAll(":scope > div")
                            event.detail.from.insertBefore(
                                event.detail.item,
                                items[event.detail.oldIndex + (event.detail.oldIndex > event.detail.newIndex)]
                            )
                            return false
                        }

                        if (sourceId === targetId) {
                            targetParentNode.moveChild(movedNode.id, event.detail.newIndex)
                        } else {
                            sourceParentNode.deleteChild(movedNode.id)
                            targetParentNode.addChild(movedNode, event.detail.newIndex)
                        }
                    })
                } else {
                    const items = event.detail.from.querySelectorAll(":scope > div")
                    event.detail.from.insertBefore(
                        event.detail.item,
                        items[event.detail.oldIndex + (event.detail.oldIndex > event.detail.newIndex)]
                    )
                    return false
                }
            }
        }
        modalStore.trigger(modal)
    }
</script>

<SortableNestedNode {node} bind:editable isRoot={true} on:save on:drag={onDrag} />
