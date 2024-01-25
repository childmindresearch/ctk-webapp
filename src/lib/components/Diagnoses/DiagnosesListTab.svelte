<script lang="ts">
  import SortableNested from "$lib/components/Diagnoses/SortableNested/SortableNested.svelte"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import { DecisionTree, type ApiNodeResponse } from "$lib/utils"

  export let readDiagnosesResponse: Response
  export let selectedNodes: DecisionTree[] = []

  let nodes: DecisionTree

  async function processDiagnoses() {
    const diagnoses = await readDiagnosesResponse.json()
    nodes = diagnoses.map((diagnosis: ApiNodeResponse) => new DecisionTree(diagnosis))[0]
  }

  function onSave(event: CustomEvent) {
    const nodeId = event.detail.id
    const node = nodes.getNodeById(nodeId)
    if (!node) return
    if (selectedNodes.find(savedNode => savedNode.id === node.id)) return
    selectedNodes = [...selectedNodes, node]
  }

  processDiagnoses()
</script>

{#if !nodes}
  <LoadingBar label="Processing diagnoses..." />
{:else}
  <SortableNested node={nodes} on:save={onSave} />
{/if}
