<script lang="ts">
    import TrashIcon from "$lib/Icons/TrashIcon.svelte"
    import type { DecisionTree } from "$lib/utils"
    import { getModalStore, getToastStore } from "@skeletonlabs/skeleton"
    import Sortable, { type SortableEvent } from "sortablejs"
    import { onMount } from "svelte"

    export let nodes: DecisionTree[]

    let elem: HTMLDivElement
    let sorter: Sortable

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    function removeNode(node: DecisionTree): void {
        nodes = nodes.filter(n => n.id !== node.id)
        toastStore.trigger({
            background: "variant-filled-success",
            message: "Diagnosis removed from selection."
        })
    }

    function getNodePath(node: DecisionTree): string[] {
        return node.getPath().slice(1)
    }

    function openDiagnosis(node: DecisionTree): void {
        modalStore.trigger({
            type: "alert",
            title: "Full text",
            body: node.text
        })
    }

    onMount(() => {
        sorter = Sortable.create(elem, {
            animation: 100,
            onEnd(event: SortableEvent) {
                if (event.oldIndex === event.newIndex) return
                if (event.oldIndex === undefined || event.newIndex === undefined) return
                const [removed] = nodes.splice(event.oldIndex, 1)
                nodes.splice(event.newIndex, 0, removed)
            }
        })
    })
</script>

{#if nodes.length === 0}
    <p class="text-center">No diagnoses selected.</p>
{/if}

<div class="table-container">
    <table class="table table-hover table-compact">
        <tbody>
            <div bind:this={elem} class="align-middle text-center">
                {#each nodes as node}
                    <tr on:dblclick={() => openDiagnosis(node)}>
                        <td>
                            <button on:click={() => removeNode(node)} class="hover-highlight">
                                <TrashIcon class="text-error-600" />
                            </button>
                        </td>
                        <td width="99%">
                            <ol class="breadcrumb">
                                {#each getNodePath(node) as path, index}
                                    {#if index !== 0}
                                        <li class="crumb-separator" aria-hidden>&rsaquo;</li>
                                    {/if}
                                    <li class="crumb">{path}</li>
                                {/each}
                            </ol>
                        </td>
                    </tr>
                {/each}
            </div>
        </tbody>
    </table>
</div>
