<script script lang="ts">
  import { DecisionTree } from "$lib/utils"
  import { SlideToggle, Tab, TabGroup } from "@skeletonlabs/skeleton"
  import Checkout from "./Checkout.svelte"
  import ListTab from "./ListTab.svelte"
  import SelectedNodes from "./SelectedNodes.svelte"
  import type { SqlDiagnosisSchema } from "$lib/server/sql"
  import { page } from "$app/stores"

  export let data: { diagnoses: SqlDiagnosisSchema[] }

  let selectedNodes: DecisionTree[] = []
  let tabSet: number = 0
  let editable: boolean = false
  let nodes: DecisionTree
  if (data.hasOwnProperty("diagnoses")) {
    nodes = new DecisionTree(data.diagnoses)
  }
</script>

{#if $page.error}
  <p>An error occurred.</p>
{:else}
  <TabGroup>
    <Tab bind:group={tabSet} name="Diagnoses" value={0}>Diagnoses List</Tab>
    <Tab bind:group={tabSet} name="Selection" value={1}>{selectedNodes.length} Selections</Tab>
    <Tab bind:group={tabSet} name="Report" value={2}>Report Generation</Tab>

    <svelte:fragment slot="panel">
      <div hidden={tabSet !== 0}>
        <div class="right-0">
          <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
        </div>
        <ListTab {nodes} bind:selectedNodes {editable} />
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
{/if}
