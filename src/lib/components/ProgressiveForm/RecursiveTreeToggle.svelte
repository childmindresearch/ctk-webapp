<!--
@component

@prop {boolean} checked - Whether the toggle is checked or not.
@prop {string} value - The name of the toggle.

This component renders a toggle switch. On change it emits a change event with
the following payload:

{
  checked: boolean,
  node: DecisionTree
}
-->

<script lang="ts">
  import { Dropdown, DropdownItem, Input, Toggle } from "flowbite-svelte"
  import { createEventDispatcher } from "svelte"
  import { patchDiagnosis } from "$lib/api"
  import type { DecisionTree } from "$lib/utils"

  export let checked: boolean
  export let node: DecisionTree

  let openDropdown = false
  let openEdit = false
  let editText = node.text
  const dispatch = createEventDispatcher()

  function onToggleChange(): void {
    dispatch("change", { checked, node })
  }

  function openDropdownMenu(event: MouseEvent): void {
    event.preventDefault()
    event.stopPropagation()
    if (event.button === 2) {
      openDropdown = true
    }
  }

  function closeDropdown(event: MouseEvent): void {
    openDropdown = false
  }

  async function onDelete(): Promise<void> {
    dispatch("delete", { id: node.id })
  }

  function onEditClick(): void {
    openEdit = true
  }

  async function submitEdit(event: KeyboardEvent): Promise<void> {
    if (event.key === "Enter") {
      await patchDiagnosis(node.id, editText)
      openEdit = false
      node.text = editText
    }
  }

  window.addEventListener("click", closeDropdown)
</script>

<div
  class="flex items-center mb-2 mr-2"
  on:contextmenu={openDropdownMenu}
  role="button"
  tabindex="0"
  aria-roledescription="Toggle for a diagnosis node, right click for edit or delete."
>
  <Toggle
    name="tree"
    bind:checked
    bind:value={node.text}
    on:change={onToggleChange}
    aria-label={"Toggle: " + node.text}
  />
  {#if openEdit}
    <Input label="Edit" bind:value={editText} on:keypress={submitEdit} />
  {:else}
    <span>{node.text}</span>
  {/if}
  <Dropdown bind:open={openDropdown} class="ml-2">
    <DropdownItem on:click={onEditClick}>Edit</DropdownItem>
    <DropdownItem on:click={onDelete}>Delete</DropdownItem>
  </Dropdown>
</div>
