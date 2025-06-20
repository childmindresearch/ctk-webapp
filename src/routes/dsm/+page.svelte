<script lang="ts">
    import XIcon from "$lib/icons/XIcon.svelte"
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import type { User } from "$lib/types"
    import { toaster } from "$lib/utils"
    import { onMount } from "svelte"
    import CreateButton from "./CreateButton.svelte"
    import EditIcon from "$lib/icons/EditIcon.svelte"
    import ModalDsmForm from "./ModalDsmForm.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import { indexForNewItemInSortedList } from "./utils"

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

    let inputDiv: HTMLDivElement
    const isAdmin = data.user?.is_admin

    onMount(() => {
        fetch("/api/dsm")
            .then(res => res.json())
            .then((data: SqlDsmCodeSchema[]) => {
                dsmCodes = data.sort((a, b) => a.label.localeCompare(b.label))
            })
        inputDiv.focus()
    })

    function onButtonClick(item: { label: string; id: number; code: string }) {
        if (selected.some(s => s.label === item.label)) {
            selected = selected.filter(s => s.label !== item.label)
            return
        }
        selected = [...selected, item]
        searchString = ""
        inputDiv.focus()
    }

    function exportToClipboard() {
        if (selected.length === 0) {
            toaster.error({ title: "No DSM codes have been selected." })
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
        toaster.info({ title: "The selected DSM codes have been copied to your clipboard." })
    }

    async function onCreate(code: string, label: string) {
        let id: number
        await fetch(`/api/dsm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, label })
        }).then(async result => {
            if (!result.ok) {
                toaster.error({
                    title: `Failed to create the DSM code: ${result.statusText}`
                })
            } else {
                id = (await result.json())["id"]
                const index = indexForNewItemInSortedList(
                    dsmCodes.map(d => d.label),
                    label
                )
                dsmCodes = [...dsmCodes.slice(0, index), { id, code, label }, ...dsmCodes.slice(index)]
                toaster.success({
                    title: `Created the DSM code.`
                })
            }
        })
    }

    async function onEdit(code: string, label: string, id?: number) {
        if (!id) return
        const dsmItems = dsmCodes.filter(code => code.id === id)
        if (dsmItems.length !== 1) {
            toaster.error({
                title: "Unexpected error editing the DSM code."
            })
            return
        }
        await fetch(`/api/dsm/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: code, label: label })
        }).then(result => {
            if (!result.ok) {
                toaster.error({
                    title: `Failed to edit the DSM code: ${result.statusText}`
                })
            } else {
                dsmItems[0].code = code
                dsmItems[0].label = label
                editingItem = null
                toaster.success({
                    title: `Edited the DSM code.`
                })
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

        // Also handle API call for deletion
        fetch(`/api/dsm/${item.id}`, {
            method: "DELETE"
        }).then(result => {
            if (!result.ok) {
                toaster.error({
                    title: `Failed to delete the DSM code: ${result.statusText}`
                })
                // Restore the item if deletion failed
                dsmCodes = [...dsmCodes, item].sort((a, b) => a.label.localeCompare(b.label))
            } else {
                toaster.success({
                    title: `Deleted the DSM code.`
                })
            }
        })
    }
</script>

{#if isAdmin}
    <span class="flex space-x-2 pb-2 h-12">
        <CreateButton {onCreate} />
    </span>
{/if}

<div class="flex space-x-2">
    <input
        bind:this={inputDiv}
        class="input max-h-10"
        type="search"
        name="autocomplete-search"
        placeholder="Search..."
        autocomplete="off"
        bind:value={searchString}
    />
    <button tabindex="-1" class="btn preset-filled-primary-500" onclick={exportToClipboard} data-testid="copyButton">
        <span>
            <i class="fas fa-copy"></i>
            Copy
        </span>
    </button>
</div>

<span class="ml-2 space-x-2 space-y-1">
    {#each selected as selection}
        <button
            class="chip preset-filled-surface-500 hover:preset-filled-surface-400"
            onclick={() => (selected = selected.filter(s => s.id !== selection.id))}
        >
            <span><XIcon /></span>
            <span>{selection.label}</span>
        </button>
    {/each}
</span>

<div class="max-h-[50vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-sm">
    {#if autoCompeleteOptions.length === 0}
        <div class="p-6 text-center text-gray-500">
            {#if searchString}
                No DSM codes found matching "<strong>{searchString}</strong>"
            {:else}
                No DSM codes available
            {/if}
        </div>
    {:else}
        <div
            class="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 grid gap-4"
            class:grid-cols-[150px_1fr_80px]={isAdmin}
            class:grid-cols-[150px_1fr]={!isAdmin}
        >
            <span>Code</span>
            <span>Description</span>
            {#if isAdmin}
                <span>Actions</span>
            {/if}
        </div>
        <ul class="divide-y divide-gray-100">
            {#each autoCompeleteOptions as option}
                <li class="hover:bg-gray-50 transition-colors duration-150 group">
                    <div
                        class="w-full px-4 py-3 grid gap-4 items-center"
                        class:grid-cols-[150px_1fr_80px]={isAdmin}
                        class:grid-cols-[150px_1fr]={!isAdmin}
                        class:bg-blue-50={selected.some(s => s.id === option.id)}
                        class:border-l-4={selected.some(s => s.id === option.id)}
                        class:border-blue-500={selected.some(s => s.id === option.id)}
                    >
                        <!-- Code column -->
                        <button class="text-left" onclick={() => onButtonClick(option)}>
                            <div class="flex flex-col">
                                <span class="font-mono text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                    {option.code}
                                </span>
                                {#if selected.some(s => s.id === option.id)}
                                    <span class="text-xs text-blue-600 font-medium mt-1">✓ Selected</span>
                                {/if}
                            </div>
                        </button>

                        <!-- Description column -->
                        <button class="text-left min-w-0" onclick={() => onButtonClick(option)}>
                            <p class="text-sm text-gray-900 group-hover:text-blue-900 leading-relaxed">
                                {option.label}
                            </p>
                        </button>

                        <!-- Actions column  -->
                        {#if isAdmin}
                            <div class="flex gap-1 justify-end">
                                <button
                                    class="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-blue-600 transition-colors"
                                    onclick={e => openEditModal(e, option)}
                                    title="Edit DSM code"
                                >
                                    <EditIcon class="w-4 h-4" />
                                </button>
                                <button
                                    class="p-1 rounded hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                                    onclick={e => onDelete(e, option)}
                                    title="Delete DSM code"
                                >
                                    <XIcon class="w-4 h-4" />
                                </button>
                            </div>
                        {/if}
                    </div>
                </li>
            {/each}
        </ul>
        {#if autoCompeleteOptions.length > 10}
            <div
                class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500 text-center"
            >
                Showing {autoCompeleteOptions.length} results
                {#if searchString}
                    for "{searchString}"
                {/if}
            </div>
        {/if}
    {/if}
</div>

<Modal
    open={isEditModalOpen}
    onOpenChange={e => {
        isEditModalOpen = e.open
        if (!e.open) {
            editingItem = null
        }
    }}
    triggerBase="btn"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[48rem] max-w-[90vw]"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        {#if editingItem}
            <ModalDsmForm
                code={editingItem.code}
                label={editingItem.label}
                onSubmit={(code: string, label: string) => onEdit(code, label, (editingItem as SqlDsmCodeSchema).id)}
                instructions="Edit the DSM code."
            />
        {/if}
    {/snippet}
</Modal>
