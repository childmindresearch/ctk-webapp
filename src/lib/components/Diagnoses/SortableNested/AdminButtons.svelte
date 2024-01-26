<script lang="ts">
  import { createDiagnosis, deleteDiagnosis, patchDiagnosis } from "$lib/api"
  import { DecisionTree } from "$lib/utils"
  import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
  import { FilePlusSolid, PenSolid, TrashBinSolid } from "flowbite-svelte-icons"
  import { shortenText } from "./utils"

  export let node: DecisionTree
  export let showCreate = true
  export let showEdit = true
  export let showDelete = true

  const modalStore = getModalStore()
  const toastStore = getToastStore()

  const instructions =
    "To add a template value, write it in all caps with underscores for spaces between two curly brackets. For example: {{CHILD_NAME}} could be used as a template for a child's name."

  const adminButtons = [
    {
      icon: FilePlusSolid,
      class: "text-success-600",
      onClick: onCreate,
      show: showCreate
    },
    {
      icon: PenSolid,
      class: "text-warning-600",
      onClick: onEdit,
      show: showEdit
    },
    {
      icon: TrashBinSolid,
      class: "text-error-600",
      onClick: onDelete,
      show: showDelete
    }
  ]

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
      type: "component",
      component: "markdown",
      meta: { instructions: instructions, value: node.text },
      response: async response => {
        if (!response) return
        await patchDiagnosis(node.id, response.value, undefined).then(() => (node.text = response.value))
      }
    }
    modalStore.trigger(modal)
  }

  async function onDelete() {
    if (!node.parent) {
      toastStore.trigger({ message: "Cannot delete the root node.", background: "variant-filled-error" })
      return
    }
    const modal: ModalSettings = {
      type: "confirm",
      title: "Delete diagnosis",
      body: `Are you sure you want to delete this and any subdirectories: "${shortenText(node.text)}"?`,
      response: async value => {
        if (!value) return
        await deleteDiagnosis(node.id).then(() => {
          node.parent = node.parent?.deleteNodeById(node.id)
        })
      }
    }
    modalStore.trigger(modal)
  }
</script>

<span class="m-3 space-x-3">
  {#each adminButtons as adminButton}
    <button on:click={adminButton.onClick} hidden={!adminButton.show}>
      <svelte:component this={adminButton.icon} class={adminButton.class} />
    </button>
  {/each}
</span>
