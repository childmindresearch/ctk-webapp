<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getModalStore, getToastStore, SlideToggle, type ModalSettings } from "@skeletonlabs/skeleton"
    import type { DecisionTree } from "../DecisionTree"
    import SortableNested from "./SortableNested.svelte"
    import ExportTemplates from "../ExportTemplates.svelte"

    export let nodes: DecisionTree
    export let selectedNodes: DecisionTree[] = []
    export let isAdmin: boolean = false

    let filteredNodes: DecisionTree = nodes
    let editable: boolean = false

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    function openSearchModal() {
        const modal: ModalSettings = {
            type: "component",
            component: "searchDecisionTree",
            meta: { root: nodes, editable: editable },
            response: (response: { value: DecisionTree }) => {
                onSave(response.value)
            }
        }
        modalStore.trigger(modal)
    }

    function onSave(node: DecisionTree) {
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
    <div class="flex space-x-3 pb-2">
        <button class="btn variant-filled-primary hover:variant-soft-primary" on:click={openSearchModal}>
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
    <SortableNested node={filteredNodes} on:save={e => onSave(e.detail.node)} {editable} />
{/if}
