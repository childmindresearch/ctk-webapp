<script lang="ts">
    import { getToastStore } from "@skeletonlabs/skeleton"
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
    const toastStore = getToastStore()

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
                toastStore.trigger({
                    message: `Failed to post a new ${name} because of ${await response.text()}.`,
                    background: "variant-error"
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

<p>
    {name}
</p>
{#if allowCreate}
    <span>
        <input class="input w-64" bind:value={postValue} name="name" placeholder="Add New" />
        <button class="btn variant-filled-primary" onclick={onPost}> Add </button>
    </span>
{/if}

<div class="grid grid-cols-4 mt-2">
    {#each selections as selection}
        <div class="flex space-x-2">
            <input
                bind:checked={selection.selected}
                type="checkbox"
                class="checkbox"
                value={selection}
                name={selection.name}
                onchange={() => onSelect(selections.filter(s => s.selected))}
            />
            <label for={selection.name}>{selection.name} </label>
        </div>
    {/each}
</div>
