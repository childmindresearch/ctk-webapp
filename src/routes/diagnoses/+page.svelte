<script script lang="ts">
  import { readDiagnoses } from "$lib/api"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import type { DecisionTree } from "$lib/utils"
  import { SlideToggle, Tab, TabGroup } from "@skeletonlabs/skeleton"
  import { onMount } from "svelte"
  import Checkout from "./Checkout.svelte"
  import ListTab from "./ListTab.svelte"
  import SelectedNodes from "./SelectedNodes.svelte"

  let selectedNodes: DecisionTree[] = []
  let tabSet: number = 0
  let editable: boolean = false

  let diagnosesPromise: Promise<any> = new Promise(() => {})

  onMount(() => {
    diagnosesPromise = readDiagnoses()
  })
</script>

{#await diagnosesPromise}
  <LoadingBar label="Loading diagnoses..." />
{:then response}
  <TabGroup>
    <Tab bind:group={tabSet} name="Diagnoses" value={0}>Diagnoses List</Tab>
    <Tab bind:group={tabSet} name="Selection" value={1}>{selectedNodes.length} Selections</Tab>
    <Tab bind:group={tabSet} name="Report" value={2}>Report Generation</Tab>

    <svelte:fragment slot="panel">
      <div hidden={tabSet !== 0}>
        <div class="right-0">
          <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
        </div>
        <ListTab readDiagnosesResponse={response} bind:selectedNodes {editable} />
      </div>
      <div hidden={tabSet !== 1}>
        <SelectedNodes bind:nodes={selectedNodes} />
      </div>
      <div hidden={tabSet !== 2}>
        {#key selectedNodes}
          <Checkout nodes={selectedNodes} />
        {/key}
      </div>
    </svelte:fragment>
  </TabGroup>
{:catch error}
  <div class="text-center text-error-500">
    <div><strong>Error: {error.message}</strong></div>
    <div>
      <strong>Contact a system administrator.</strong>
    </div>
  </div>
{/await}
