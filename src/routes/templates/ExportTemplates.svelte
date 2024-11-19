<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getToastStore } from "@skeletonlabs/skeleton"
    import { DecisionTree } from "./DecisionTree.svelte"

    import { nodesToMarkdown } from "./TemplatesDirectory/templateExport"
    import { downloadBlob } from "$lib/utils"

    export let nodes: DecisionTree

    let isLoading = false
    const toastStore = getToastStore()

    function exportTemplates() {
        if (!nodes) {
            toastStore.trigger({ message: "Templates have not finished loading.", background: "variant-filled-error" })
            return
        }
        isLoading = true
        const markdown = nodesToMarkdown(nodes)
        const form = new FormData()
        form.append("markdown", markdown)

        fetch("/api/markdown2docx", {
            method: "POST",
            body: form
        })
            .then(async res => {
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                return await res.blob()
            })
            .then(blob => {
                const filename = "allTemplates.docx"
                downloadBlob(blob, filename)
                isLoading = false
            })
            .catch(error => {
                toastStore.trigger({ message: error.message, background: "variant-filled-error" })
                isLoading = false
            })
    }
</script>

{#if isLoading}
    <LoadingBar label="Preparing template document." />
{:else}
    <button
        disabled={isLoading}
        class="btn variant-filled-primary hover:variant-soft-primary"
        on:click={exportTemplates}
    >
        Export Templates
    </button>
{/if}
