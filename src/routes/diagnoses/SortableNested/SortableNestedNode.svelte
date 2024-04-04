<script lang="ts">
    import type { DecisionTree } from "$lib/utils"
    import { CartPlusOutline, FolderOpenSolid, FolderSolid } from "flowbite-svelte-icons"
    import Sortable, { type SortableEvent } from "sortablejs"
    import { createEventDispatcher, onMount } from "svelte"
    import { slide } from "svelte/transition"
    import AdminButtons from "./AdminButtons.svelte"
    import { shortenText } from "$lib/utils"

    export let node: DecisionTree
    export let editable = false
    export let isRoot = true

    let isFolded = !isRoot
    let sorter: Sortable

    const dispatch = createEventDispatcher()

    function fold() {
        if (isRoot) return
        isFolded = !isFolded
    }

    function onSave() {
        dispatch("save", { id: node.id })
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
    })

    $: sorter?.option("disabled", !editable)
</script>

<div id={`node-${node.id}`}>
    <div>
        <!-- Inner div is necessary because otherwise the child elements are individually draggable.-->
        <div class="flex items-center" transition:slide>
            <button class="hover-highlight" on:click={node.children.length === 0 ? onSave : fold}>
                {#if node.children.length === 0}
                    <CartPlusOutline class="text-secondary-400" size="lg" />
                {:else if isFolded}
                    <FolderSolid class="text-secondary-900" size="lg" />
                {:else}
                    <FolderOpenSolid class="text-secondary-600" size="lg" />
                {/if}
            </button>
            <span tabindex="0" role="textbox" aria-multiline="true">
                {shortenText(node.text)}
            </span>
            {#if editable}
                <AdminButtons bind:node showDelete={!isRoot} showEdit={!isRoot} />
            {/if}
        </div>
        {#if !isFolded}
            <div class="border-secondary-500 border-l-2 pl-3 mb-2" transition:slide>
                {#each node.children as child}
                    {#key child.id}
                        <svelte:self bind:node={child} bind:editable isRoot={false} on:drag on:save on:create />
                    {/key}
                {/each}
            </div>
        {/if}
    </div>
</div>
