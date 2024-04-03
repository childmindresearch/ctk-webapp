<script lang="ts">
    import type { DecisionTree } from "$lib/utils"
    import { shortenText } from "$lib/utils"
    import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import SortableNestedNode from "./SortableNestedNode.svelte"

    export let node: DecisionTree
    export let editable = true

    const modalStore = getModalStore()

    async function onDrag(event: CustomEvent) {
        const targetId = parseInt(event.detail.to.id.split("-")[1])
        const sourceId = parseInt(event.detail.from.id.split("-")[1])

        const sourceNode = node.getNodeById(sourceId)
        const targetParentNode = node.getNodeById(targetId)?.parent

        if (!sourceNode || !targetParentNode) return
        const modal: ModalSettings = {
            type: "confirm",
            title: "Move diagnosis",
            body: `Are you sure you want to move "${shortenText(sourceNode.text)}" to "${shortenText(
                targetParentNode.text
            )}"?`,
            response: async confirmed => {
                if (confirmed) {
                    await fetch(`/api/diagnoses/${sourceId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ parentId: targetId })
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
