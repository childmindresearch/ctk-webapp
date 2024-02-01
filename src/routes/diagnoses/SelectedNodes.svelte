<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { ArrowDownSolid, ArrowUpSolid, TrashBinSolid } from "flowbite-svelte-icons"
  import { getNodePath, getTemplateText } from "./utils"

  export let nodes: DecisionTree[]

  let templates = getTemplateText(nodes)
  let values = Array(templates.length).fill("")

  const buttons = [
    {
      icon: TrashBinSolid,
      class: "text-secondary-600",
      onClick: (node: DecisionTree) => removeNode(node)
    },
    {
      icon: ArrowDownSolid,
      class: "text-primary-600",
      onClick: (node: DecisionTree) => shiftNode(node, 1)
    },
    {
      icon: ArrowUpSolid,
      class: "text-primary-600",
      onClick: (node: DecisionTree) => shiftNode(node, -1)
    }
  ]

  function removeNode(node: DecisionTree): void {
    nodes = nodes.filter(n => n.id !== node.id)
    const oldTemplates = templates
    const oldValues = values
    templates = getTemplateText(nodes)
    values = templates.map(template => {
      const index = oldTemplates.findIndex(oldTemplate => oldTemplate === template)
      return index === -1 ? "" : oldValues[index]
    })
  }

  function shiftNode(node: DecisionTree, shift: number): void {
    const index = nodes.findIndex(n => n.id === node.id)
    const newIndex = index + shift
    if (newIndex < 0 || newIndex >= nodes.length) return
    const result = [...nodes]
    const [removed] = result.splice(index, 1)
    result.splice(newIndex, 0, removed)
    nodes = result
  }
</script>

{#if nodes.length === 0}
  <p class="text-center">No diagnoses selected.</p>
{/if}

<div class="space-y-2">
  {#each nodes as node}
    <span class="flex gap-3 items-center">
      {#each buttons as button}
        <button on:click={() => button.onClick(node)} class="hover-highlight">
          <svelte:component this={button.icon} class={button.class} />
        </button>
      {/each}
      <ol class="breadcrumb">
        {#each getNodePath(node) as path, index}
          {#if index !== 0}
            <li class="crumb-separator" aria-hidden>&rsaquo;</li>
          {/if}
          <li class="crumb">{path}</li>
        {/each}
      </ol>
    </span>
  {/each}
</div>
