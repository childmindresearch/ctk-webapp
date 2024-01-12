<!--
    @component
    @prop {DecisionTree} node - The current node to render.

    A recursive component that renders a category and its children. The
    component is recursive because it renders itself if the current node has
    children. The component is used to render the diagnosis tree. It is
    recommended to not call this component directly, but rather to use the
    RecursiveTreeRoot component.

    Example usage:
    <RecursiveCategory node={root} />
 -->
<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import { AccordionItem } from "flowbite-svelte"
  import { createEventDispatcher, onMount } from "svelte"
  import RecursiveTreeToggle from "./RecursiveTreeToggle.svelte"

  export let node: DecisionTree

  let child: DecisionTree | undefined = undefined
  let toggles: { [key: string]: boolean } = node.getSelectedInChildren()
  let labels: string[]
  let open: boolean = node.selected
  let selectedLabel: string | undefined = undefined
  let selectedChild: DecisionTree | undefined = undefined

  const dispatch = createEventDispatcher()

  function shouldRenderChild(childNode: DecisionTree | undefined): boolean {
    if (!childNode) return false
    if (childNode.children.length === 0) return false
    return childNode.children.length > 1 || !childNode.children[0].isLeaf()
  }

  function onToggleChange(event: CustomEvent): void {
    selectedChild = event.detail.node
    if (!selectedChild) return

    node.setAllSelected(false)
    node.selected = true
    selectedChild.selected = event.detail.checked

    if (selectedChild.selected) {
      selectedLabel = selectedChild.text
    } else {
      selectedLabel = undefined
    }

    open = !event.detail.checked
    dispatch("change")
  }

  function onChildToggleChange(): void {
    dispatch("change")
  }

  function onDelete(event: CustomEvent): void {
    dispatch("delete", { id: event.detail.id })
  }

  onMount(() => {
    toggles = labels
      .map(label => ({ [label]: false }))
      .reduce((allToggles, currentToggle) => ({ ...allToggles, ...currentToggle }), {})
  })

  $: labels = node.children.map(child => child.text)
  $: toggles, (child = node.children.find(child => toggles[child.text]))
  $: selectedLabel, (open = !selectedLabel)
</script>

{#if !node.isLeaf()}
  <AccordionItem bind:open>
    <span slot="header" class="w-full">
      {#if selectedChild && selectedLabel}
        <RecursiveTreeToggle
          bind:checked={toggles[selectedLabel]}
          bind:node={selectedChild}
          on:change={onToggleChange}
          on:delete={onDelete}
        />
      {:else}
        Current Selection
      {/if}
    </span>
    <div class="columns-2xs">
      {#each node.children as child}
        <RecursiveTreeToggle
          bind:checked={toggles[child.text]}
          bind:node={child}
          on:change={onToggleChange}
          on:delete={onDelete}
        />
      {/each}
    </div>
  </AccordionItem>
{/if}

{#if shouldRenderChild(child)}
  <svelte:self bind:node={child} on:change={() => onChildToggleChange()} on:delete={onDelete} />
{/if}
