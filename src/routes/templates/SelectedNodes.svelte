<script lang="ts">
    import ArrowDownIcon from "$lib/icons/ArrowDownIcon.svelte"
    import ArrowUpIcon from "$lib/icons/ArrowUpIcon.svelte"
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import { getToastStore } from "@skeletonlabs/skeleton"
    import { flip } from "svelte/animate"
    import { quintOut } from "svelte/easing"
    import type { DecisionTree } from "./DecisionTree.svelte"

    export let nodes: DecisionTree[]

    const toastStore = getToastStore()

    function removeNode(node: DecisionTree): void {
        nodes = nodes.filter(n => n.id !== node.id)
        toastStore.trigger({
            background: "variant-filled-success",
            message: "Template removed from selection."
        })
    }

    function getNodePath(node: DecisionTree): string[] {
        return node.getPath().slice(1)
    }

    function move(node: DecisionTree, by: number): void {
        const index = nodes.findIndex(n => n.id == node.id)
        if (index === undefined) {
            return
        }
        const swapIndex = index + by
        if (swapIndex < 0 || swapIndex >= nodes.length) {
            return
        }
        ;[nodes[index], nodes[swapIndex]] = [nodes[swapIndex], nodes[index]]
    }
</script>

{#if nodes.length === 0}
    <p class="text-center">No templates selected.</p>
{/if}

<div class="table-container">
    <table class="table table-hover table-compact">
        <tbody class="align-middle text-center">
            {#each nodes as node (node)}
                <tr animate:flip={{ delay: 0, duration: 250, easing: quintOut }}>
                    <td class="flex gap-x-2">
                        <button on:click={() => move(node, -1)}>
                            <ArrowUpIcon />
                        </button>
                        <button on:click={() => move(node, 1)}>
                            <ArrowDownIcon />
                        </button>
                        <div></div>
                        <button on:click={() => removeNode(node)}>
                            <TrashIcon class="text-error-600" />
                        </button>
                    </td>
                    <td width="99%">
                        <ol class="breadcrumb">
                            {#each getNodePath(node) as path, index}
                                {#if index !== 0}
                                    <li class="crumb-separator" aria-hidden={true}>&rsaquo;</li>
                                {/if}
                                <li class="crumb">{path}</li>
                            {/each}
                        </ol>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
