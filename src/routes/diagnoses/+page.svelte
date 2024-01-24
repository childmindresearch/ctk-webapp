<script script lang="ts">
  import { readDiagnoses } from "$lib/api"
  import DiagnosesCheckout from "$lib/components/Diagnoses/DiagnosesCheckout.svelte"
  import SelectedNodes from "$lib/components/Diagnoses/SelectedNodes.svelte"
  import SortableNested from "$lib/components/Diagnoses/SortableNested/SortableNested.svelte"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import { diagnosesTree } from "$lib/store"
  import { DecisionTree } from "$lib/utils"
  import { Tab, TabGroup } from "@skeletonlabs/skeleton"
  import { onMount } from "svelte"

  let nodes: DecisionTree[] = []

  let tabSet: number = 0

  onMount(async () => {
    const response = await readDiagnoses()
    const diagnoses = await response.json()
    const tree = diagnoses.map((diagnosis: any) => new DecisionTree(diagnosis))
    diagnosesTree.set(tree)
  })

  function onSave(event: CustomEvent) {
    const nodeId = event.detail.id
    const node = $diagnosesTree[0].getNodeById(nodeId)
    if (!node) return
    if (nodes.find(savedNode => savedNode.id === node.id)) return
    nodes = [...nodes, node]
  }
</script>

<p class="mb-5">
  Please select a diagnosis that applies to your patient. Once you have selected a diagnosis, a text will appear that
  allows you to save this text. Once you've saved all texts you're interested in, you can click the "Show Diagnosis"
  button to fill in the requisite information and generate the report text.
</p>

<TabGroup>
  <Tab bind:group={tabSet} name="Diagnoses" value={0}>Diagnoses List</Tab>
  <Tab bind:group={tabSet} name="Selection" value={1}>{nodes.length} Selections</Tab>
  <Tab bind:group={tabSet} name="Report" value={2}>Report Generation</Tab>

  <svelte:fragment slot="panel">
    {#if tabSet === 0}
      {#if !$diagnosesTree}
        <LoadingBar label="Loading diagnoses..." />
      {:else}
        <SortableNested node={$diagnosesTree[0]} on:save={onSave} />
      {/if}
    {:else if tabSet === 1}
      <SelectedNodes bind:nodes />
    {:else if tabSet === 2}
      <DiagnosesCheckout {nodes} />
    {/if}
  </svelte:fragment>
</TabGroup>
