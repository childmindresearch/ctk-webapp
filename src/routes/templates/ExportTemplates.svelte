<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getToastStore } from "@skeletonlabs/skeleton"
    import { DecisionTree } from "./DecisionTree"

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
        let markdown = nodesToMarkdown(nodes)

        fetch("/api/markdown2docx", {
            method: "POST",
            body: markdown
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
