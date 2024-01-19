<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { SlideToggle } from "@skeletonlabs/skeleton"
  import SortableNestedNode from "./SortableNestedNode.svelte"

  export let node: DecisionTree
  export let editable = true
</script>

<div>
  <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
</div>
<SortableNestedNode {node} bind:editable isRoot={true} on:save />
