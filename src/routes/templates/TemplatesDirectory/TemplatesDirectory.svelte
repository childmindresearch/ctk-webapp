<script lang="ts">
    import { Switch } from "$lib/components/ui/switch"
    import { Label } from "$lib/components/ui/label"
    import { Button } from "$lib/components/ui/button"
    import * as Dialog from "$lib/components/ui/dialog"
    import { Search } from "lucide-svelte"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import SortableNested from "./SortableNested.svelte"
    import ExportTemplates from "../ExportTemplates.svelte"
    import ModalSearchDecisionTree from "./ModalSearchDecisionTree.svelte"
    import { openNodeIds } from "./store"
    import { Spinner } from "$lib/components/ui/spinner"

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
    <Spinner />
{:else}
    <div class="flex space-x-3 pb-2">
        <Dialog.Root bind:open={isSearchModalOpen}>
            <Dialog.Trigger>
                <Button variant="default">
                    <Search class="mr-2 h-4 w-4" />
                    Search
                </Button>
            </Dialog.Trigger>
            <Dialog.Content class="max-w-4xl max-h-[90vh] p-0">
                <ModalSearchDecisionTree root={nodes} {onSearchClick} onSaveClick={onAddToCart} />
            </Dialog.Content>
        </Dialog.Root>

        {#if isAdmin}
            <ExportTemplates {nodes} />
            <div class="flex items-center space-x-2 ml-auto">
                <Switch
                    id="editable-mode"
                    checked={editable}
                    onCheckedChange={checked => {
                        editable = checked
                    }}
                />
                <Label for="editable-mode">Editable</Label>
            </div>
        {/if}
    </div>

    <SortableNested node={filteredNodes} {onAddToCart} {editable} />
{/if}
