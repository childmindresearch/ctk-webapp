<script script lang="ts">
  import { readDiagnoses } from "$lib/api"
  import DiagnosesCheckout from "$lib/components/Diagnoses/DiagnosesCheckout.svelte"
  import DiagnosesErrorHandler from "$lib/components/Diagnoses/DiagnosesErrorHandler.svelte"
  import DiagnosesListTab from "$lib/components/Diagnoses/DiagnosesListTab.svelte"
  import SelectedNodes from "$lib/components/Diagnoses/SelectedNodes.svelte"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import type { DecisionTree } from "$lib/utils"
  import { Tab, TabGroup } from "@skeletonlabs/skeleton"
  import { onMount } from "svelte"

  let selectedNodes: DecisionTree[] = []
  let tabSet: number = 0

  let diagnosesPromise: Promise<any> = new Promise(() => {})

  function onSave(event: CustomEvent) {
    selectedNodes = event.detail.selectedNodes
  }

  onMount(() => {
    diagnosesPromise = readDiagnoses()
  })
</script>

<p class="mb-5">
  Please select a diagnosis that applies to your patient. Once you have selected a diagnosis, a text will appear that
  allows you to save this text. Once you've saved all texts you're interested in, you can click the "Show Diagnosis"
  button to fill in the requisite information and generate the report text.
</p>

{#await diagnosesPromise}
  <LoadingBar label="Loading diagnoses..." />
{:then response}
  <TabGroup>
    <Tab bind:group={tabSet} name="Diagnoses" value={0}>Diagnoses List</Tab>
    <Tab bind:group={tabSet} name="Selection" value={1}>{selectedNodes.length} Selections</Tab>
    <Tab bind:group={tabSet} name="Report" value={2}>Report Generation</Tab>

    <svelte:fragment slot="panel">
      <div hidden={tabSet !== 0}>
        <DiagnosesListTab readDiagnosesResponse={response} on:save={onSave} bind:selectedNodes />
      </div>
      <div hidden={tabSet !== 1}>
        <SelectedNodes bind:nodes={selectedNodes} />
      </div>
      <div hidden={tabSet !== 2}>
        {#key selectedNodes}
          <DiagnosesCheckout nodes={selectedNodes} />
        {/key}
      </div>
    </svelte:fragment>
  </TabGroup>
{:catch error}
  <DiagnosesErrorHandler {error} />
{/await}
