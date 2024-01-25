<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { SlideToggle, type ModalSettings, getModalStore } from "@skeletonlabs/skeleton"
  import SortableNestedNode from "./SortableNestedNode.svelte"
  import { shortenText } from "./utils"
  import { patchDiagnosis } from "$lib/api"

  export let node: DecisionTree
  export let editable = true

  const modalStore = getModalStore()

  async function onDrag(event: CustomEvent) {
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
</script>

<div>
  <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
</div>
<SortableNestedNode {node} bind:editable isRoot={true} on:save on:drag={onDrag} />
