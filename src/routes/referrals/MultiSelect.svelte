<!--
Creates a multi-selection for modal forms.

Requires that the GET all and POST endpoints are at the same URL. Further
requires that the table contains only an `id` and `name` property.
-->

<script lang="ts">
    import { toaster } from "$lib/utils"
    import { onMount } from "svelte"

    type Props = {
        name: string
        endpoint: string
        allowCreate: boolean
        isSelected?: string[]
        onSelect: (arg0: { id: number; name: string; selected: boolean }[]) => void
    }

    let { name, endpoint, allowCreate = false, isSelected = [], onSelect }: Props = $props()
    let postValue = $state("")

    let selections: { id: number; name: string; selected: boolean }[] = $state([])

    onMount(async () => {
        const entries: { id: number; name: string }[] = await (await fetch(endpoint)).json()
        selections = entries
            .map(entry => {
                return { id: entry.id, name: entry.name, selected: isSelected.includes(entry.name) }
            })
            .sort((a, b) => a.name.localeCompare(b.name))
    })

    async function onPost(event: Event) {
        event.preventDefault()
        if (!postValue) return
        await fetch(endpoint, { method: "POST", body: JSON.stringify({ name: postValue }) }).then(async response => {
            if (!response.ok) {
                toaster.error({
                    title: `Failed to post a new ${name}.`,
                    description: await response.text()
                })
                return
            }
            const newEntry: { id: number; name: string } = await response.json()
            selections.push({
                id: newEntry.id,
                name: newEntry.name,
                selected: true
            })
        })
    }
</script>

<div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <h3 class="h3">{name}</h3>
        <span class="badge variant-soft-secondary text-xs">
            {selections.filter(s => s.selected).length} selected
        </span>
    </div>

    <!-- Add new option -->
    {#if allowCreate}
        <div class="card p-4">
            <form class="flex gap-3" onsubmit={onPost}>
                <input
                    class="input flex-1"
                    bind:value={postValue}
                    name="name"
                    placeholder={`Add new ${name.toLowerCase()}...`}
                    autocomplete="off"
                />
                <button type="submit" class="btn variant-filled-primary px-6" disabled={!postValue.trim()}>
                    Add
                </button>
            </form>
        </div>
    {/if}

    <div class="card p-4">
        {#if selections.length === 0}
            <div class="text-center py-8">
                <p class="opacity-60">No options available</p>
            </div>
        {:else}
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {#each selections as selection}
                    <label
                        class="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-surface-100-800-token {selection.selected
                            ? 'bg-primary-50-900-token ring-1 ring-primary-500'
                            : 'hover:bg-surface-50-900-token'}"
                        for={`checkbox-${selection.id}`}
                    >
                        <input
                            id={`checkbox-${selection.id}`}
                            bind:checked={selection.selected}
                            type="checkbox"
                            class="checkbox"
                            onchange={() => onSelect(selections.filter(s => s.selected))}
                        />
                        <span class="flex-1 font-medium text-sm">
                            {selection.name}
                        </span>
                        {#if selection.selected}
                            <span class="text-primary-500 text-xs">✓</span>
                        {/if}
                    </label>
                {/each}
            </div>
        {/if}
    </div>
</div>
