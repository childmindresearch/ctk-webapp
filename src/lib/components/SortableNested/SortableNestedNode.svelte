<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { ArrowDownSolid, FolderOpenSolid, FolderSolid } from "flowbite-svelte-icons"
  import Sortable, { type SortableEvent } from "sortablejs"
  import { createEventDispatcher, onMount } from "svelte"
  import { slide } from "svelte/transition"
  import AdminButtons from "./AdminButtons.svelte"
  import { shortenText } from "./utils"
  import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton"
  import { patchDiagnosis } from "$lib/api"

  export let node: DecisionTree
  export let editable = false
  export let isRoot = true

  let isFolded = !isRoot
  let sorter: Sortable

  const dispatch = createEventDispatcher()
  const modalStore = getModalStore()

  async function OnEnd(event: SortableEvent) {
    const customEvent = new CustomEvent("end", {
      detail: {
        oldIndex: event.oldIndex,
        newIndex: event.newIndex,
        to: event.to,
        from: event.from,
        item: event.item
      }
    })
    onDrag(customEvent)
  }

  async function onDrag(event: CustomEvent) {
    if (!isRoot) {
      dispatch("drag", event.detail)
      return
    }

    const targetId = parseInt(event.detail.to.id.split("-")[1])
    const sourceId = parseInt(event.detail.from.id.split("-")[1])

    const sourceNode = node.getNodeById(sourceId)
    const targetParentNode = node.getNodeById(targetId)?.parent

    if (!sourceNode || !targetParentNode) return
    const modal: ModalSettings = {
      type: "confirm",
      title: "Move diagnosis",
      body: `Are you sure you want to move "${shortenText(sourceNode.text)}" to "${shortenText(
        targetParentNode.text
      )}"?`,
      response: async confirmed => {
        if (confirmed) {
          await patchDiagnosis(sourceId, undefined, targetId)
        } else {
          const items = event.detail.from.querySelectorAll(":scope > div")
          event.detail.from.insertBefore(
            event.detail.item,
            items[event.detail.oldIndex + (event.detail.oldIndex > event.detail.newIndex)]
          )
          return false
        }
      }
    }
    modalStore.trigger(modal)
  }

  function fold() {
    if (isRoot) return
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
      onEnd: OnEnd
    })
  })

  $: sorter?.option("disabled", !editable)
</script>

<div id={`node-${node.id}`}>
  <div>
    <!-- Inner div is necessary because otherwise the child elements are individually draggable.-->
    <button class="center-button" disabled={isRoot}>
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
      <AdminButtons bind:node showDelete={!isRoot} showEdit={!isRoot} />
    {/if}
    {#if !isFolded}
      <div class="border-secondary-500 border-l-2 pl-3 mb-3" transition:slide>
        {#each node.children as child}
          <svelte:self bind:node={child} bind:editable isRoot={false} on:drag={onDrag} on:save on:create />
        {/each}
      </div>
    {/if}
  </div>
</div>
