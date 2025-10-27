<script lang="ts">
  import type { SqlDsmCodeSchema } from "$lib/server/sql"
  import type { User } from "$lib/types"
  import { onMount } from "svelte"
  import CreateButton from "./CreateButton.svelte"
  import ModalDsmForm from "./ModalDsmForm.svelte"
  import { indexForNewItemInSortedList } from "./utils"
  import { X, Pencil, Copy } from "lucide-svelte"
  import { toast } from "svelte-sonner"
  import { Input } from "$lib/components/ui/input"
  import { Button } from "$lib/components/ui/button"
  import { Badge } from "$lib/components/ui/badge"
  import * as Dialog from "$lib/components/ui/dialog"
  import * as Table from "$lib/components/ui/table"

  type Props = { data: { user: User } }
  let { data }: Props = $props()

  let searchString = $state("")
  let selected: SqlDsmCodeSchema[] = $state([])
  let dsmCodes: SqlDsmCodeSchema[] = $state([])
  let isEditModalOpen = $state(false)
  let editingItem = $state<SqlDsmCodeSchema | null>(null)

  let autoCompeleteOptions = $derived(
    dsmCodes.filter(code => (code.code + " " + code.label).toLowerCase().includes(searchString.toLowerCase()))
  )

  const isAdmin = data.user?.is_admin

  onMount(() => {
    fetch("/api/dsm")
      .then(res => res.json())
      .then((data: SqlDsmCodeSchema[]) => {
        dsmCodes = data.sort((a, b) => a.label.localeCompare(b.label))
      })
  })

  function onButtonClick(item: { label: string; id: number; code: string }) {
    if (selected.some(s => s.label === item.label)) {
      selected = selected.filter(s => s.label !== item.label)
      return
    }
    selected = [...selected, item]
    searchString = ""
  }

  function exportToClipboard() {
    if (selected.length === 0) {
      toast.error("No DSM codes have been selected.")
      return
    }
    function itemToString(item: { label: string; code: string }) {
      if (item.code.length < 13) {
        return [item.code, item.label].join("\t\t")
      } else {
        return [item.code, item.label].join("\t")
      }
    }
    navigator.clipboard.writeText(selected.map(s => itemToString(s)).join("\n") + "\n")
    toast.info("The selected DSM codes have been copied to your clipboard.")
  }

  async function onCreate(code: string, label: string) {
    let id: number
    await fetch("/api/dsm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, label })
    }).then(async result => {
      if (!result.ok) {
        toast.error(`Failed to create the DSM code: ${result.statusText}`)
      } else {
        id = (await result.json())["id"]
        const index = indexForNewItemInSortedList(
          dsmCodes.map(d => d.label),
          label
        )
        dsmCodes = [...dsmCodes.slice(0, index), { id, code, label }, ...dsmCodes.slice(index)]
        toast.success("Created the DSM code.")
      }
    })
  }

  async function onEdit(code: string, label: string, id?: number) {
    if (!id) return
    const dsmItems = dsmCodes.filter(code => code.id === id)
    if (dsmItems.length !== 1) {
      toast.error("Unexpected error editing the DSM code.")
      return
    }
    await fetch(`/api/dsm/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code, label: label })
    }).then(result => {
      if (!result.ok) {
        toast.error(`Failed to edit the DSM code: ${result.statusText}`)
      } else {
        dsmItems[0].code = code
        dsmItems[0].label = label
        editingItem = null
        toast.success("Edited the DSM code.")
      }
    })
    isEditModalOpen = false
  }

  function openEditModal(event: MouseEvent, item: SqlDsmCodeSchema) {
    event.stopPropagation()
    editingItem = item
    isEditModalOpen = true
  }

  function onDelete(event: MouseEvent, item: SqlDsmCodeSchema) {
    event.stopPropagation()
    if (!confirm(`Are you sure you want to delete "${item.label}"?`)) {
      return
    }
    dsmCodes = dsmCodes.filter(code => code.id !== item.id)
    selected = selected.filter(code => code.id !== item.id)

    fetch(`/api/dsm/${item.id}`, {
      method: "DELETE"
    }).then(result => {
      if (!result.ok) {
        toast.error(`Failed to delete the DSM code: ${result.statusText}`)
        dsmCodes = [...dsmCodes, item].sort((a, b) => a.label.localeCompare(b.label))
      } else {
        toast.success("Deleted the DSM code.")
      }
    })
  }
</script>

{#if isAdmin}
  <div class="flex space-x-2 pb-2 h-12">
    <CreateButton {onCreate} />
  </div>
{/if}

<div class="flex space-x-2 mb-4">
  <Input
    class="max-h-10"
    type="search"
    name="autocomplete-search"
    placeholder="Search..."
    autocomplete="off"
    bind:value={searchString}
  />
  <Button tabindex={-1} onclick={exportToClipboard} data-testid="copyButton">
    <Copy class="w-4 h-4 mr-2" />
    Copy
  </Button>
</div>

<div class="ml-2 space-x-2 space-y-1 mb-4">
  {#each selected as selection}
    <Badge
      variant="secondary"
      class="cursor-pointer hover:bg-secondary/80"
      onclick={() => (selected = selected.filter(s => s.id !== selection.id))}
    >
      <X class="w-3 h-3 mr-1" />
      {selection.label}
    </Badge>
  {/each}
</div>

<div class="rounded-md border">
  {#if autoCompeleteOptions.length === 0}
    <div class="p-6 text-center text-muted-foreground">
      {#if searchString}
        No DSM codes found matching "<strong>{searchString}</strong>"
      {:else}
        No DSM codes available
      {/if}
    </div>
  {:else}
    <div class="max-h-[50vh] overflow-y-auto">
      <Table.Root>
        <Table.Header class="sticky top-0 bg-background">
          <Table.Row>
            <Table.Head class="w-[150px]">Code</Table.Head>
            <Table.Head>Description</Table.Head>
            {#if isAdmin}
              <Table.Head class="w-[100px] text-right">Actions</Table.Head>
            {/if}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each autoCompeleteOptions as option}
            <Table.Row
              class={`cursor-pointer group ${selected.some(s => s.id === option.id) ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}
            >
              <Table.Cell onclick={() => onButtonClick(option)}>
                <div class="flex flex-col">
                  <span class="font-mono text-sm font-medium group-hover:text-blue-600">
                    {option.code}
                  </span>
                </div>
              </Table.Cell>
              <Table.Cell onclick={() => onButtonClick(option)}>
                <p class="text-sm leading-relaxed group-hover:text-blue-900">
                  {option.label}
                </p>
              </Table.Cell>
              {#if isAdmin}
                <Table.Cell class="text-right">
                  <div class="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                      onclick={e => openEditModal(e, option)}
                      title="Edit DSM code"
                    >
                      <Pencil class="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 hover:bg-red-100 hover:text-red-600"
                      onclick={e => onDelete(e, option)}
                      title="Delete DSM code"
                    >
                      <X class="w-4 h-4" />
                    </Button>
                  </div>
                </Table.Cell>
              {/if}
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
    {#if autoCompeleteOptions.length > 10}
      <div class="border-t bg-muted/50 px-4 py-2 text-xs text-muted-foreground text-center">
        Showing {autoCompeleteOptions.length} results
        {#if searchString}
          for "{searchString}"
        {/if}
      </div>
    {/if}
  {/if}
</div>

<Dialog.Root bind:open={isEditModalOpen}>
  <Dialog.Content class="max-w-[48rem]">
    {#if editingItem}
      <ModalDsmForm
        code={editingItem.code}
        label={editingItem.label}
        onSubmit={(code: string, label: string) => onEdit(code, label, editingItem?.id)}
        instructions="Edit the DSM code."
      />
    {/if}
  </Dialog.Content>
</Dialog.Root>
