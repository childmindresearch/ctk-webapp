<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { ArrowDownSolid, FolderOpenSolid, FolderSolid } from "flowbite-svelte-icons"
  import Sortable from "sortablejs"
  import { createEventDispatcher, onMount } from "svelte"
  import { slide } from "svelte/transition"
  import EditButtons from "./EditButtons.svelte"
  import { shortenText } from "./utils"

  export let node: DecisionTree
  export let editable = false
  export let isFoldable = true

  let isFolded = isFoldable
  let sorter: Sortable

  const dispatch = createEventDispatcher()

  function fold() {
    if (!isFoldable) return
    isFolded = !isFolded
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
      onEnd: event => {
        dispatch("drag", {
          sourceDivName: event.from.id,
          targetDivName: event.to.id
        })
      }
    })
  })

  $: sorter?.option("disabled", !editable)
</script>

<div id={`node-${node.id}`}>
  <div>
    <!-- Inner div is necessary because otherwise the child elmeents are individually draggable.-->
    <button class="center-button">
      {#if node.children.length === 0}
        <ArrowDownSolid class="text-tertiary-500" on:click={() => dispatch("save", { id: node.id })} />
      {:else if isFolded}
        <FolderSolid class="text-primary-500" on:click={fold} />
      {:else}
        <FolderOpenSolid class="text-secondary-500" on:click={fold} />
      {/if}
    </button>
    <span tabindex="0" role="textbox" aria-multiline="true">
      {shortenText(node.text)}
    </span>
    {#if editable}
      <EditButtons bind:node />
    {/if}
    {#if !isFolded}
      <div class="border-secondary-500 border-l-2 pl-3 mb-3" transition:slide>
        {#each node.children as child}
          <svelte:self bind:node={child} bind:editable on:drag on:save on:create />
        {/each}
      </div>
    {/if}
  </div>
</div>
