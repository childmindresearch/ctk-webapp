<script lang="ts">
  import SortableNested from "$lib/components/SortableNested/SortableNested.svelte"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import { DecisionTree, type ApiNodeResponse } from "$lib/utils"
  import { getToastStore } from "@skeletonlabs/skeleton"

  export let readDiagnosesResponse: Response
  export let selectedNodes: DecisionTree[] = []
  export let editable: boolean = false

  let nodes: DecisionTree

  const toastStore = getToastStore()

  async function processDiagnoses() {
    const diagnoses = await readDiagnosesResponse.json()
    nodes = diagnoses.map((diagnosis: ApiNodeResponse) => new DecisionTree(diagnosis))[0]
  }

  function onSave(event: CustomEvent) {
    const nodeId = event.detail.id
    const node = nodes.getNodeById(nodeId)

    if (!node) return
    if (selectedNodes.find(savedNode => savedNode.id === node.id)) {
      toastStore.trigger({
        background: "variant-filled-warning",
        message: "This diagnosis is already selected."
      })
      return
    }

    selectedNodes = [...selectedNodes, node]
    toastStore.trigger({
      background: "variant-filled-success",
      message: "Diagnosis added to selection."
    })
  }

  processDiagnoses()
</script>

{#if !nodes}
  <LoadingBar label="Processing diagnoses..." />
{:else}
  <SortableNested node={nodes} on:save={onSave} {editable} />
{/if}
