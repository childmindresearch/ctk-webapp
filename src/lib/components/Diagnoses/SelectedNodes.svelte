<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { ArrowDownSolid, ArrowUpSolid, TrashBinSolid } from "flowbite-svelte-icons"

  export let nodes: DecisionTree[]

  let templates = getTemplateText(nodes)
  let values = Array(templates.length).fill("")

  function allUpperCaseUnderscoreToCapitalizedSpace(input: string): string {
    return input
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  function getTemplateText(nodes: DecisionTree[]): string[] {
    const templates = new Set<string>()
    nodes.forEach(node => {
      const matches = node.text.match(/{{(.*?)}}/g)
      if (!matches) return
      matches.forEach(match => {
        const template = match.replace(/{{|}}/g, "").trim()
        templates.add(allUpperCaseUnderscoreToCapitalizedSpace(template))
      })
    })
    return Array.from(templates)
  }

  function getNodePath(node: DecisionTree): string[] {
    return node.getPath().slice(1)
  }

  function removeNode(node: DecisionTree): void {
    console.log("called remove node")
    nodes = nodes.filter(n => n.id !== node.id)
    const oldTemplates = templates
    const oldValues = values
    templates = getTemplateText(nodes)
    values = templates.map(template => {
      const index = oldTemplates.findIndex(oldTemplate => oldTemplate === template)
      return index === -1 ? "" : oldValues[index]
    })
    console.log(nodes, templates, values)
  }

  function shiftNode(node: DecisionTree, shift: number): void {
    console.log("called shiftnode")
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
      <button on:click={() => removeNode(node)}>
        <TrashBinSolid class="text-error-600" />
      </button>
      <button on:click={() => shiftNode(node, 1)}>
        <ArrowDownSolid class="text-primary-600" />
      </button>
      <button on:click={() => shiftNode(node, -1)}>
        <ArrowUpSolid class="text-primary-600" />
      </button>
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
