<script lang="ts">
    import { FilePlus2, FolderClosed, FolderOpen } from "@lucide/svelte"
    import Sortable, { type SortableEvent } from "sortablejs"
    import { onMount } from "svelte"
    import SvelteMarkdown from "svelte-markdown"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import CreateButton from "./CreateButton.svelte"
    import DeleteButton from "./DeleteButton.svelte"
    import EditButton from "./EditButton.svelte"
    import SortableNestedNode from "./SortableNestedNode.svelte"
    import { openNodeIds } from "./store"

    type Props = {
        node: DecisionTree
        editable: boolean
        onDrag: (event: Sortable.SortableEvent) => Promise<void>
        onAddToCart: (node: DecisionTree) => void
        _isRoot?: boolean
    }
    let { node, editable, onDrag, onAddToCart, _isRoot }: Props = $props()
    let sorter: Sortable | undefined = undefined
    let hasDragged = $state(false)

    async function onDragChildren(event: Sortable.SortableEvent) {
        await onDrag(event)
        hasDragged = !hasDragged
    }

    function fold() {
        if (_isRoot) return
        if ($openNodeIds.has(node.id)) {
            openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
        } else {
            openNodeIds.set(new Set([...$openNodeIds, node.id]))
        }
    }

    let isFolded = $state(_isRoot ? false : !$openNodeIds.has(node.id))
    const unsubscribe = openNodeIds.subscribe(value => {
        if (node === undefined) return
        isFolded = _isRoot ? false : !value.has(node.id)
    })

    onMount(() => {
        const rootElem = document.getElementById(`node-${node.id}`)
        if (!rootElem) return
        if (node.children.length === 0) return
        sorter = Sortable.create(rootElem, {
            group: {
                name: `node-${node.id}`,
                put: true,
                pull: true
            },
            disabled: true,
            animation: 100,
            onEnd: (event: SortableEvent) => {
                if (
                    [event.oldIndex, event.newIndex, event.to, event.from, event.item].every(
                        value => value !== undefined
                    )
                ) {
                    onDragChildren(event)
                }
            }
        })
        return unsubscribe
    })

    $effect(() => sorter?.option("disabled", !editable))
</script>

<div>
    <div class="flex items-center space-x-1">
        <button class="hover-highlight" onclick={node.children.length === 0 ? () => onAddToCart(node) : fold}>
            {#if node.children.length === 0}
                <FilePlus2 class="text-secondary-400 hover:text-secondary-200" size="1.3rem" />
            {:else if isFolded}
                <FolderClosed class="text-secondary-900 hover:text-secondary-700" size="1.3rem" />
            {:else}
                <FolderOpen class="text-secondary-600 hover:text-secondary-400" size="1.3rem" />
            {/if}
        </button>
        <div class="indented-list overflow-y-auto max-h-[200px]">
            <SvelteMarkdown source={node.text} />
        </div>
        {#if editable}
            <span class="grid grid-rows-1 grid-flow-col gap-1 items-center">
                <CreateButton {node} />
                {#if !_isRoot}
                    <EditButton {node} />
                    <DeleteButton {node} />
                {/if}
            </span>
        {/if}
    </div>

    <div id={`node-${node.id}`} class:hidden={isFolded} class="border-secondary-500 border-l-2 pl-3 mb-2">
        {#if !isFolded}
            {#key hasDragged}
                {#each node.children as child, index (child.id)}
                    <SortableNestedNode node={node.children[index]} {editable} onDrag={onDragChildren} {onAddToCart} />
                {/each}
            {/key}
        {/if}
    </div>
</div>
