<script lang="ts">
    import { PutTemplate } from "$api/v1/templates/[id]"
    import * as AlertDialog from "$lib/shadcn/components/ui/alert-dialog"
    import { Button } from "$lib/shadcn/components/ui/button"
    import { FetchError, shortenText } from "$lib/utils"
    import Sortable, { type SortableEvent } from "sortablejs"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import SortableNestedNode from "./SortableNestedNode.svelte"

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
        if (!lastEvent || lastEvent.newIndex === undefined) return

        const targetId = parseInt(lastEvent.to.id.split("-")[1])
        const sourceId = parseInt(lastEvent.from.id.split("-")[1])
        const sourceParentNode = node.getNodeById(sourceId) as DecisionTree

        const result = await PutTemplate.fetch({
            pathArgs: [movedNode.id],
            body: {
                text: movedNode.text,
                parentId: (targetParentNode as DecisionTree).id,
                priority: lastEvent.newIndex
            }
        })
        if (!(result instanceof FetchError)) {
            if (sourceId === targetId) {
                // @ts-expect-error Typescript doesn't detect that newIndex cannot be undefined.
                targetParentNode.moveChild(movedNode.id, lastEvent.newIndex)
            } else {
                sourceParentNode.deleteChild(movedNode.id)
                ;(targetParentNode as DecisionTree).addChild(movedNode, (lastEvent as SortableEvent).newIndex)
            }
        }

        modalClose()
    }
</script>

{#if targetParentNode !== null}
    <AlertDialog.Root bind:open={isModalOpen}>
        <AlertDialog.Content>
            <AlertDialog.Header>
                <AlertDialog.Title>Move template</AlertDialog.Title>
                <AlertDialog.Description>
                    Are you sure you want to move
                    <span class="font-semibold">{shortenText(movedNode.text)}</span>
                    to
                    <span class="font-semibold">{shortenText((targetParentNode as DecisionTree).text)}</span>?
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Cancel>
                    <Button variant="outline">Cancel</Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                    <Button onclick={onMove}>Move</Button>
                </AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>
{/if}

<SortableNestedNode {node} {editable} _isRoot={true} {onAddToCart} {onDrag} />
