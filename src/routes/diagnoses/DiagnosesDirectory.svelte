<script lang="ts">
    import SortableNested from "./SortableNested/SortableNested.svelte"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { DecisionTree } from "$lib/utils"
    import { getToastStore } from "@skeletonlabs/skeleton"

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
                message: "This diagnosis is already selected."
            })
            return
        }

        selectedNodes = [...selectedNodes, node]
        toastStore.trigger({
            background: "variant-filled-success",
            message: "Diagnosis added to selection."
        })
    }
</script>

{#if !nodes}
    <LoadingBar label="Processing diagnoses..." />
{:else}
    <SortableNested node={nodes} on:save={onSave} {editable} />
{/if}
