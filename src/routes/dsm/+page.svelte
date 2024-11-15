<script lang="ts">
    import XIcon from "$lib/icons/XIcon.svelte"
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import type { User } from "$lib/types"
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"
    import CreateButton from "./CreateButton.svelte"
    import DeleteButton from "./DeleteButton.svelte"
    import EditButton from "./EditButton.svelte"
    import { indexForNewItemInSortedList } from "./utils"

    type Props = { data: { user: User } }
    let { data }: Props = $props()

    let searchString = $state("")
    let selected: SqlDsmCodeSchema[] = $state([])

    let dsmCodes: SqlDsmCodeSchema[] = $state([])
    let autoCompeleteOptions = $derived(
        dsmCodes.filter(code => (code.code + " " + code.label).toLowerCase().includes(searchString.toLowerCase()))
    )
    let inputDiv: HTMLDivElement

    const isAdmin = data.user?.is_admin
    const toastStore = getToastStore()
    const copyToast: ToastSettings = {
        message: "The selected DSM codes have been copied to your clipboard."
    }
    const noSelectionToast: ToastSettings = {
        message: "No DSM codes have been selected.",
        background: "variant-filled-error"
    }

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
            toastStore.trigger(noSelectionToast)
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
        toastStore.trigger(copyToast)
    }

    function onCreate(item: SqlDsmCodeSchema) {
        const index = indexForNewItemInSortedList(
            dsmCodes.map(d => d.label),
            item.label
        )
        dsmCodes = [...dsmCodes.slice(0, index), item, ...dsmCodes.slice(index)]
    }

    function onDelete(item: SqlDsmCodeSchema) {
        dsmCodes = dsmCodes.filter(code => code.id !== item.id)
        selected = selected.filter(code => code.id !== item.id)
    }
</script>

<span class="flex space-x-2 pb-2 h-12">
    {#if isAdmin}
        <CreateButton {onCreate} />
    {/if}
</span>

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

    <button tabindex="-1" class="btn variant-filled-primary" onclick={exportToClipboard}>
        <span>
            <i class="fas fa-copy"></i>
            Copy
        </span>
    </button>
</div>

<span class="ml-2 space-x-2 space-y-1">
    {#each selected as selection}
        <button
            class="chip variant-filled hover:variant-filled"
            onclick={() => (selected = selected.filter(s => s.id !== selection.id))}
        >
            <span><XIcon /></span>
            <span>{selection.label}</span>
        </button>
    {/each}
</span>

<div class="max-h-[40vh] p-4 overflow-y-auto border-2 bg-white">
    <ul class="w-full">
        {#each autoCompeleteOptions as option}
            <li class:grid-cols-1={!isAdmin} class:grid-cols-[70px_auto]={isAdmin} class="grid w-full">
                {#if isAdmin}
                    <span class="grid grid-cols-2 mt-2 gap-3 mr-4">
                        <EditButton bind:dsmItem={dsmCodes[dsmCodes.findIndex(dsm => dsm.id === option.id)]} />
                        <DeleteButton dsmItem={option} {onDelete} />
                    </span>
                {/if}
                <button
                    class="btn hover:variant-ghost-primary flex justify-start text-left w-full"
                    class:variant-soft-primary={selected.some(s => s.label === option.label)}
                    onclick={() => onButtonClick(option)}
                >
                    {option.label}
                </button>
            </li>
        {/each}
    </ul>
</div>
