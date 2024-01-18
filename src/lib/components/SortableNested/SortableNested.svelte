<script lang="ts">
  import { patchDiagnosis } from "$lib/api"
  import type { DecisionTree } from "$lib/utils"
  import { SlideToggle } from "@skeletonlabs/skeleton"
  import SortableNestedNode from "./SortableNestedNode.svelte"

  export let node: DecisionTree
  export let editable = true

  async function onDrag(event: CustomEvent) {
    const targetId = parseInt(event.detail.targetDivName.split("-")[1])
    const sourceId = parseInt(event.detail.sourceDivName.split("-")[1])

    await patchDiagnosis(sourceId, undefined, targetId)
  }
</script>

<div>
  <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
</div>
<SortableNestedNode {node} bind:editable isFoldable={false} on:drag={onDrag} on:save />
