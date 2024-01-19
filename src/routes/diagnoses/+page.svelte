<script script lang="ts">
  import { readDiagnoses } from "$lib/api"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import SortableNested from "$lib/components/SortableNested/SortableNested.svelte"
  import { diagnosesTree } from "$lib/store"
  import { DecisionTree } from "$lib/utils"
  import { onMount } from "svelte"

  onMount(async () => {
    const response = await readDiagnoses()
    const diagnoses = await response.json()
    const tree = diagnoses.map((diagnosis: any) => new DecisionTree(diagnosis))
    diagnosesTree.set(tree)
  })

  async function onSave(event: CustomEvent) {
    console.log("hi")
  }
</script>

<p class="mb-5">
  Please select a diagnosis that applies to your patient. Once you have selected a diagnosis, a text will appear that
  allows you to save this text. Once you've saved all texts you're interested in, you can click the "Show Diagnosis"
  button to fill in the requisite information and generate the report text.
</p>
{#if !$diagnosesTree}
  <LoadingBar label="Loading diagnoses..." />
{:else}
  <SortableNested node={$diagnosesTree[0]} on:save={onSave} />
{/if}
