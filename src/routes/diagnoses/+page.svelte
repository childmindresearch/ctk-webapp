<!--
  The page for selecting diagnoses. It contains a form that allows the user to select a diagnosis from a tree of
  diagnoses. Once a diagnosis is selected, a text will appear that can be copied and pasted into the report.
-->

<script lang="ts">
  import { API_ROUTE } from "$lib/api"
  import ProgressiveForm from "$lib/components/ProgressiveForm/ProgressiveForm.svelte"
  import { diagnosesTree } from "$lib/stores"
  import { DecisionTree } from "$lib/utils"
  import { P, Spinner } from "flowbite-svelte"
  import { onMount } from "svelte"

  onMount(async () => {
    const response = await fetch(`${API_ROUTE}/diagnoses`)
    const diagnoses = await response.json()
    const tree = diagnoses.map((diagnosis: any) => new DecisionTree(diagnosis))
    diagnosesTree.set(tree)
  })
</script>

<P class="mb-5">
  Please select a diagnosis that applies to your patient. Once you have selected a diagnosis, a text will appear that
  allows you to save this text. Once you've saved all texts you're interested in, you can click the "Show Diagnosis"
  button to fill in the requisite information and generate the report text.
</P>
{#if !$diagnosesTree}
  <Spinner />
{:else}
  <ProgressiveForm tree={diagnosesTree} />
{/if}
