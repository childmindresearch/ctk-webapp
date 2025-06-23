<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { Switch } from "@skeletonlabs/skeleton-svelte"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import SortableNested from "./SortableNested.svelte"
    import ExportTemplates from "../ExportTemplates.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import ModalSearchDecisionTree from "./ModalSearchDecisionTree.svelte"
    import { openNodeIds } from "./store"

    type Props = {
        nodes: DecisionTree
        onAddToCart: (node: DecisionTree) => void
        isAdmin: boolean
    }
    let { nodes, onAddToCart, isAdmin = false }: Props = $props()

    let filteredNodes: DecisionTree = nodes
    let editable = $state(false)
    let isSearchModalOpen = $state(false)

    function onSearchClick(node: DecisionTree) {
        const parents = node.getAncestors()
        const ids = [...parents.map(parent => parent.id), node.id]
        openNodeIds.set(new Set(ids))
        isSearchModalOpen = false
    }
</script>

{#if !nodes}
    <LoadingBar label="Processing templates..." />
{:else}
    <div class="flex space-x-3 pb-2">
        <Modal
            open={isSearchModalOpen}
            onOpenChange={e => (isSearchModalOpen = e.open)}
            triggerBase="btn preset-filled-primary-500"
            contentBase="card bg-surface-50 p-4 space-y-4 w-[80%]"
            backdropClasses="backdrop-blur-sm"
        >
            {#snippet trigger()}
                <i class="fas fa-search mr-2"></i>
                Search
            {/snippet}
            {#snippet content()}
                <ModalSearchDecisionTree root={nodes} {onSearchClick} onSaveClick={onAddToCart} />
            {/snippet}
        </Modal>

        {#if isAdmin}
            <ExportTemplates bind:nodes />
            <div class="right-0 content-center">
                <Switch
                    name="slider-editable"
                    checked={editable}
                    onCheckedChange={e => {
                        editable = e.checked
                    }}>Editable</Switch
                >
            </div>
        {/if}
    </div>
    <SortableNested node={filteredNodes} {onAddToCart} {editable} />
{/if}
