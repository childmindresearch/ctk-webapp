<script script lang="ts">
  import { readDiagnoses } from "$lib/api"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import SortableNested from "$lib/components/SortableNested/SortableNested.svelte"
  import DiagnosesModal from "$lib/components/DiagnosesModal.svelte"
  import { diagnosesTree } from "$lib/store"
  import { DecisionTree } from "$lib/utils"
  import { getModalStore, type ModalComponent, type ModalSettings } from "@skeletonlabs/skeleton"
  import { onMount } from "svelte"

  let savedNodes: DecisionTree[] = []
  let templates: Set<string>
  const modalStore = getModalStore()

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
    if (savedNodes.find(savedNode => savedNode.id === node.id)) return
    savedNodes = [...savedNodes, node]
  }

  function getTemplateText(): string[] {
    templates = new Set<string>()
    savedNodes.forEach(node => {
      const matches = node.text.match(/{{(.*?)}}/g)
      if (!matches) return
      matches.forEach(match => {
        const template = match.replace(/{{|}}/g, "").trim()
        templates.add(template)
      })
    })
    return Array.from(templates)
  }

  function diagnosesCheckout() {
    const modalComponent: ModalComponent = { ref: DiagnosesModal }
    const modal: ModalSettings = {
      type: "component",
      component: modalComponent,
      meta: { templates: getTemplateText() }
    }
    modalStore.trigger(modal)
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

<button class="btn variant-filled-primary" disabled={savedNodes.length == 0} on:click={diagnosesCheckout}>
  Checkout {savedNodes.length} Diagnoses
</button>
