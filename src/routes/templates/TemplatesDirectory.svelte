<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getToastStore } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "./DecisionTree"
    import SortableNested from "./SortableNested/SortableNested.svelte"

    export let nodes: DecisionTree
    export let selectedNodes: DecisionTree[] = []
    export let editable: boolean = false

    const toastStore = getToastStore()

    function onSave(event: CustomEvent) {
        const nodeId = event.detail.id
        const node = nodes.getNodeById(nodeId)

        if (!node) return
        if (selectedNodes.find(savedNode => savedNode.id === node.id)) {
            toastStore.trigger({
                background: "variant-filled-warning",
                message: "This template is already selected."
            })
            return
        }

        selectedNodes = [...selectedNodes, node]
        toastStore.trigger({
            background: "variant-filled-success",
            message: "Template added to selection."
        })
    }
</script>

{#if !nodes}
    <LoadingBar label="Processing templates..." />
{:else}
    <SortableNested node={nodes} on:save={onSave} {editable} />
{/if}
