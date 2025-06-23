<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { toaster } from "$lib/utils"
    import { DecisionTree } from "./DecisionTree.svelte"

    import { downloadBlob } from "$lib/utils"
    import { nodesToMarkdown } from "./TemplatesDirectory/templateExport"

    export let nodes: DecisionTree

    let isLoading = false

    function exportTemplates() {
        if (!nodes) {
            toaster.error({ title: "Templates have not finished loading." })
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
                toaster.error({ title: error.message })
                isLoading = false
            })
    }
</script>

{#if isLoading}
    <LoadingBar label="Preparing template document." />
{:else}
    <button
        disabled={isLoading}
        class="btn preset-filled-primary-500 hover:preset-soft-primary-500"
        on:click={exportTemplates}
    >
        Export Templates
    </button>
{/if}
