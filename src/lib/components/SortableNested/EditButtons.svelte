<script lang="ts">
  import { createDiagnosis, deleteDiagnosis, patchDiagnosis } from "$lib/api"
  import { diagnosesTree } from "$lib/stores"
  import { DecisionTree } from "$lib/utils"
  import { getModalStore, type ModalSettings } from "@skeletonlabs/skeleton"
  import { FilePlusSolid, PenSolid, TrashBinSolid } from "flowbite-svelte-icons"
  import { shortenText } from "./utils"

  export let node: DecisionTree

  const modalStore = getModalStore()

  async function onCreate() {
    const modal: ModalSettings = {
      type: "prompt",
      title: `Create diagnosis.`,
      body: `Create a new diagnosis inside "${shortenText(node.text)}".`,
      response: async value => {
        if (!value) return
        await createDiagnosis(value, node.id).then(async response => {
          if (!response || !response.ok) return
          const data = await response.json()
          node.children = [...node.children, new DecisionTree(data)]
        })
      }
    }
    modalStore.trigger(modal)
  }

  async function onEdit() {
    const modal: ModalSettings = {
      type: "prompt",
      title: "Edit the diagnosis text.",
      value: node.text,
      response: async value => {
        if (!value) return
        await patchDiagnosis(node.id, value, undefined).then(() => (node.text = value))
      }
    }
    modalStore.trigger(modal)
  }

  async function onDelete() {
    const modal: ModalSettings = {
      type: "confirm",
      title: "Delete diagnosis",
      body: `Are you sure you want to delete this and any subdirectories: "${shortenText(node.text)}"?`,
      response: async value => {
        if (!value) return
        await deleteDiagnosis(node.id).then(() => {
          $diagnosesTree = [$diagnosesTree[0].deleteNodeById(node.id)]
        })
      }
    }
    modalStore.trigger(modal)
  }
</script>

<span class="m-3 space-x-3">
  <button on:click={onCreate}>
    <FilePlusSolid class="text-success-600" />
  </button>
  <button on:click={onEdit}>
    <PenSolid class="text-warning-600" />
  </button>
  <button on:click={onDelete}>
    <TrashBinSolid class="text-error-600" />
  </button>
</span>
