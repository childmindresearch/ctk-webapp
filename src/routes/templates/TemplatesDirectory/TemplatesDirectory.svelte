<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getModalStore, getToastStore, SlideToggle, type ModalSettings } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import SortableNested from "./SortableNested.svelte"
    import ExportTemplates from "../ExportTemplates.svelte"

    type Props = {
        nodes: DecisionTree
        onAddToCart: (node: DecisionTree) => void
        isAdmin: boolean
    }
    let { nodes, onAddToCart, isAdmin = false }: Props = $props()

    let filteredNodes: DecisionTree = nodes
    let editable: boolean = $state(false)

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    function openSearchModal() {
        const modal: ModalSettings = {
            type: "component",
            component: "searchDecisionTree",
            meta: { root: nodes, editable: editable },
            response: (response: { value: DecisionTree }) => {
                onAddToCart(response.value)
            }
        }
        modalStore.trigger(modal)
    }
</script>

{#if !nodes}
    <LoadingBar label="Processing templates..." />
{:else}
    <div class="flex space-x-3 pb-2">
        <button class="btn variant-filled-primary hover:variant-soft-primary" onclick={openSearchModal}>
            <i class="fas fa-search mr-2"></i>
            Search
        </button>
        {#if isAdmin}
            <ExportTemplates bind:nodes />
            <div class="right-0 content-center">
                <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
            </div>
        {/if}
    </div>
    <SortableNested node={filteredNodes} {onAddToCart} {editable} />
{/if}
