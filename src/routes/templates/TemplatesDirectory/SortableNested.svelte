<script lang="ts">
    import { shortenText } from "$lib/utils"
    import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import SortableNestedNode from "./SortableNestedNode.svelte"
    import Sortable from "sortablejs"

    type Props = {
        node: DecisionTree
        onAddToCart: (node: DecisionTree) => void
        editable?: boolean
    }
    let { node, onAddToCart, editable = true }: Props = $props()

    const modalStore = getModalStore()

    async function onDrag(event: Sortable.SortableEvent) {
        if (event.oldIndex === undefined) return
        if (event.newIndex === undefined) return

        const targetId = parseInt(event.to.id.split("-")[1])
        const sourceId = parseInt(event.from.id.split("-")[1])

        if (targetId === sourceId && event.oldIndex === event.newIndex) return

        const sourceParentNode = node.getNodeById(sourceId)
        const targetParentNode = node.getNodeById(targetId)
        if (!sourceParentNode || !targetParentNode) return
        const movedNode = sourceParentNode.children[event.oldIndex]

        if (!sourceParentNode || !targetParentNode) return
        await new Promise<boolean>(resolve => {
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
                                priority: event.newIndex
                            })
                        }).then(response => {
                            if (!response.ok) {
                                const items = event.from.querySelectorAll(":scope > div")
                                event.from.insertBefore(
                                    event.item,
                                    // @ts-expect-error Typescript doesn't detect that oldIndex cannot be undefined.
                                    items[event.oldIndex + (event.oldIndex > event.newIndex)]
                                )
                                resolve(false)
                            }

                            if (sourceId === targetId) {
                                // @ts-expect-error Typescript doesn't detect that newIndex cannot be undefined.
                                targetParentNode.moveChild(movedNode.id, event.newIndex)
                            } else {
                                sourceParentNode.deleteChild(movedNode.id)
                                targetParentNode.addChild(movedNode, event.newIndex)
                            }
                            resolve(true)
                        })
                    } else {
                        const items = event.from.querySelectorAll(":scope > div")
                        // @ts-expect-error Typescript doesn't detect that oldIndex and newIndex cannot be undefined.
                        event.from.insertBefore(event.item, items[event.oldIndex + (event.oldIndex > event.newIndex)])
                        resolve(false)
                    }
                }
            }
            modalStore.trigger(modal)
        }).then(() => {})
    }
</script>

<SortableNestedNode {node} {editable} _isRoot={true} {onAddToCart} {onDrag} />
