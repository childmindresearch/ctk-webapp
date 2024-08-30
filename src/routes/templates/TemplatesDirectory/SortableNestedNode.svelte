<script lang="ts">
    import CartPlusIcon from "$lib/icons/CartPlusIcon.svelte"
    import FolderClosedIcon from "$lib/icons/FolderClosedIcon.svelte"
    import FolderOpenIcon from "$lib/icons/FolderOpenIcon.svelte"
    import Sortable, { type SortableEvent } from "sortablejs"
    import { createEventDispatcher, onMount } from "svelte"
    import SvelteMarkdown from "svelte-markdown"
    import type { DecisionTree } from "../DecisionTree"
    import CreateButton from "./CreateButton.svelte"
    import DeleteButton from "./DeleteButton.svelte"
    import EditButton from "./EditButton.svelte"
    import { openNodeIds } from "./store"

    export let node: DecisionTree
    export let editable = false
    export let isRoot = true

    let sorter: Sortable
    let keyUpdateChildren = false

    const dispatch = createEventDispatcher()

    function fold() {
        if (isRoot) return
        if ($openNodeIds.has(node.id)) {
            openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
        } else {
            openNodeIds.set(new Set([...$openNodeIds, node.id]))
        }
    }
    let isFolded = isRoot ? false : !$openNodeIds.has(node.id)
    const unsubscribe = openNodeIds.subscribe(value => {
        isFolded = isRoot ? false : !value.has(node.id)
    })

    function onSave() {
        dispatch("save", { node: node })
    }

    function updateChildren() {
        // Ensure children are re-rendered.
        node.children = node.children
    }

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
                dispatch("drag", {
                    oldIndex: event.oldIndex,
                    newIndex: event.newIndex,
                    to: event.to,
                    from: event.from,
                    item: event.item
                })
            }
        })
        return unsubscribe
    })

    $: sorter?.option("disabled", !editable)
</script>

<div>
    <div class="flex items-center space-x-1">
        <button class="hover-highlight" on:click={node.children.length === 0 ? onSave : fold}>
            {#if node.children.length === 0}
                <CartPlusIcon class="text-secondary-400" />
            {:else if isFolded}
                <FolderClosedIcon class="text-secondary-900" />
            {:else}
                <FolderOpenIcon class="text-secondary-600" />
            {/if}
        </button>
        <div class="indented-list overflow-y-scroll max-h-[200px]">
            <SvelteMarkdown source={node.text} />
        </div>
        {#if editable}
            <div>
                <span class="grid grid-rows-1 grid-flow-col gap-0">
                    <CreateButton
                        {node}
                        oncreate={() => {
                            updateChildren()
                            dispatch("update")
                        }}
                    />
                    {#if !isRoot}
                        <EditButton {node} onedit={() => dispatch("update")} />
                        <DeleteButton {node} ondelete={() => dispatch("update")} />
                    {/if}
                </span>
            </div>
        {/if}
    </div>

    <div id={`node-${node.id}`} class:hidden={isFolded} class="border-secondary-500 border-l-2 pl-3 mb-2">
        {#if !isFolded}
            {#each node.children as child}
                <svelte:self
                    bind:node={child}
                    bind:editable
                    isRoot={false}
                    on:drag
                    on:save
                    on:create
                    on:update={updateChildren}
                />
            {/each}
        {/if}
    </div>
</div>
