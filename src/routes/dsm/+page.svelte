<script lang="ts">
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"

    let searchString = ""
    let dsmCodes: SqlDsmCodeSchema[] = []
    let autoCompeleteOptions: { label: string; value: string; code: string }[] = []
    let selected: { label: string; value: string; code: string }[] = []
    let inputDiv: HTMLDivElement

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

    function onButtonClick(item: { label: string; value: string; code: string }) {
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

        function itemToString(item: { label: string; value: string; code: string }) {
            if (item.code.length < 13) {
                return [item.code, item.label].join("\t\t")
            } else {
                return [item.code, item.label].join("\t")
            }
        }
        navigator.clipboard.writeText(selected.map(s => itemToString(s)).join("\n") + "\n")
        toastStore.trigger(copyToast)
    }

    $: autoCompeleteOptions = dsmCodes
        .filter(code => !selected.some(s => s.value === String(code.label)))
        .filter(code => (code.code + " " + code.label).toLowerCase().includes(searchString.toLowerCase()))
        .map(code => {
            return {
                label: code.label.trim(),
                value: String(code.id),
                code: code.code.trim()
            }
        })
</script>

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

<div class="max-w-[60rem] max-h-[80vh] p-4 overflow-y-auto border-2 bg-white">
    <ul>
        {#each autoCompeleteOptions as option}
            <li>
                <button
                    class="btn hover:variant-ghost-primary"
                    class:variant-soft-primary={selected.some(s => s.label === option.label)}
                    on:click={() => onButtonClick(option)}
                >
                    {option.label}
                </button>
            </li>
        {/each}
    </ul>
</div>
