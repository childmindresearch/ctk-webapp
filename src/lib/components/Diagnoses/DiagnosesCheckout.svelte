<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { getToastStore } from "@skeletonlabs/skeleton"
  import type { DecisionTree } from "$lib/utils"

  export let nodes: DecisionTree[]

  const templates = getTemplateText(nodes)
  const userTemplates = templates.map(template => allUpperCaseUnderscoreToCapitalizedSpace(template))
  let values = Array(templates.length).fill("")

  const dispatch = createEventDispatcher()
  const toastStore = getToastStore()

  function onSubmit(event: Event) {
    event.preventDefault()
    if (values.some(value => value === "")) {
      toastStore.trigger({ message: "Please fill all the fields.", background: "variant-filled-error" })
      return
    }

    let text = nodes.map(node => node.text).join("\n\n")
    templates.forEach((template, index) => {
      text = text.replace(new RegExp(`\{\{${template}\}\}`, "g"), values[index])
    })
    console.log(text)
    dispatch("submit", values)
  }

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
        templates.add(template)
      })
    })
    return Array.from(templates)
  }
</script>

<div class="space-y-2">
  {#if userTemplates.length === 0}
    <p class="text-center">No fields required.</p>
  {:else}
    <p class="text-center">Please fill in the following fields:</p>
  {/if}
  {#each userTemplates as template, index}
    <div>
      <span>{template}</span>
      <input class="input" type="text" placeholder={template} bind:value={values[index]} />
    </div>
  {/each}
  <button class="btn variant-filled-primary" on:click={onSubmit}>Download</button>
</div>
