<script lang="ts">
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import { getToastStore, SlideToggle, type ToastSettings } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"
    import EditButton from "./EditButton.svelte"
    import CreateButton from "./CreateButton.svelte"
    import DeleteButton from "./DeleteButton.svelte"
    import { indexForNewItemInSortedList } from "./utils"
    import XIcon from "$lib/icons/XIcon.svelte"

    export let data

    let searchString = ""
    let dsmCodes: SqlDsmCodeSchema[] = []
    let autoCompeleteOptions: SqlDsmCodeSchema[] = []
    let selected: SqlDsmCodeSchema[] = []
    let inputDiv: HTMLDivElement
    let editable: boolean
    let isAdmin = data.user?.is_admin

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
        if (selected.some(s => s.label === item.label)) return
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
    }

    $: autoCompeleteOptions = dsmCodes.filter(code =>
        (code.code + " " + code.label).toLowerCase().includes(searchString.toLowerCase())
    )
</script>

<span class="flex space-x-2 pb-2 h-12">
    {#if isAdmin}
        <div class="right-0 content-center">
            <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
        </div>
    {/if}

    {#if editable}
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

    <button tabindex="-1" class="btn variant-filled-primary" on:click={exportToClipboard}>
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
            on:click={() => (selected = selected.filter(s => s.id !== selection.id))}
        >
            <span><XIcon /></span>
            <span>{selection.label}</span>
        </button>
    {/each}
</span>

<div class="max-h-[40vh] p-4 overflow-y-auto border-2 bg-white">
    <ul class="w-full">
        {#each autoCompeleteOptions as option}
            <li class="grid grid-cols-[auto_100px] w-full">
                <button
                    class="btn hover:variant-ghost-primary"
                    class:variant-soft-primary={selected.some(s => s.label === option.label)}
                    on:click={() => onButtonClick(option)}
                >
                    {option.label}
                </button>
                {#if editable}
                    <span>
                        <EditButton bind:dsmItem={option} />
                        <DeleteButton dsmItem={option} {onDelete} />
                    </span>
                {/if}
            </li>
        {/each}
    </ul>
</div>
