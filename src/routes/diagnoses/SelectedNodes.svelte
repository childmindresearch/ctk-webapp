<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { getModalStore, getToastStore } from "@skeletonlabs/skeleton"
  import { TrashBinSolid } from "flowbite-svelte-icons"
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
      <div bind:this={elem}>
        {#each nodes as node}
          <tr on:dblclick={() => openDiagnosis(node)}>
            <td>
              <button on:click={() => removeNode(node)} class="hover-highlight">
                <TrashBinSolid class="text-error-600" />
              </button>
            </td>
            <td width="99%">
              <ol class="breadcrumb mt-1">
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
