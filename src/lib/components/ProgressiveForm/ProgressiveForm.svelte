<!---
  @component
  @prop {Object} tree - The tree data structure used to render the form.

  ProgressiveForm is a Svelte component that renders a form based on a tree
  data structure. It takes a tree object as a prop and recursively renders each
  level of the tree as a Category component. The user can select options at each
  level, which updates the selections array. The labels array is updated based
  on the current selections, and the text variable is updated with the selected
  options at the deepest level of the tree. The component also includes a
  resetToggles function that resets the toggles array for all levels below the
  current level when a selection is made.
-->
<script lang="ts">
  import Toast from "$lib/components/Toast.svelte"
  import type { DecisionTree } from "$lib/utils"
  import { Button, Hr } from "flowbite-svelte"
  import DiagnosisCheckout from "./DiagnosisCheckout.svelte"
  import RecursiveTree from "./RecursiveTree.svelte"
  import TemplateTextBox from "./TemplateTextBox.svelte"
  import { DiagnosisNode } from "./utils"
  import { deleteDiagnosis } from "$lib/api"
  import type { Writable } from "svelte/store"

  export let tree: Writable<DecisionTree[]>

  let openModal = false
  let root = $tree[0]
  let selectedText: string | undefined = undefined
  let noChildError = false
  let diagnoses: DiagnosisNode[] = []

  let toastWarningNoDiagnosesSelected = false

  function onToggleChange(): void {
    console.log(root.getSelection())
    if (root.getSelection().children.length == 0) {
      selectedText = undefined
      noChildError = true
    } else if (root.getSelection().children[0].isLeaf()) {
      selectedText = root.getSelection().children[0].text
      noChildError = false
    } else {
      selectedText = undefined
      noChildError = false
    }
  }

  function saveDiagnosis(): void {
    if (!selectedText) return
    const diagnosis = new DiagnosisNode(selectedText, root.getPath(), root.getSelection().id)
    if (diagnoses.find(d => d.text === diagnosis.text)) return
    diagnoses = [...diagnoses, diagnosis]
  }

  async function onDelete(event: CustomEvent): Promise<void> {
    const response = await deleteDiagnosis(event.detail.id)
    if (!response?.ok) return
    root = root.deleteNodeById(event.detail.id)
  }

  function onOpenModal(): void {
    if (diagnoses.length === 0) {
      toastWarningNoDiagnosesSelected = true
      return
    }
    openModal = true
  }

  $: tree.set([root])
</script>

<RecursiveTree bind:node={root} on:change={onToggleChange} on:delete={onDelete} />
{#if selectedText}
  <Hr />
  <TemplateTextBox bind:text={selectedText} on:save={saveDiagnosis} on:delete={onDelete} />
{/if}

<Button class="mt-3 end-0 bottom-0" on:click={onOpenModal}>Show {diagnoses.length} diagnoses</Button>
<DiagnosisCheckout bind:diagnoses bind:open={openModal} />

<Toast type="error" bind:open={noChildError} message="No child nodes." />
<Toast type="warning" bind:open={toastWarningNoDiagnosesSelected} message="No diagnoses selected." />
