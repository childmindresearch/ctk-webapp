<script lang="ts">
    import { DecisionTree } from "./DecisionTree.svelte"
    import { downloadBlob } from "$lib/utils"
    import { nodesToMarkdown } from "./TemplatesDirectory/templateExport"
    import { Spinner } from "$lib/components/ui/spinner"
    import { toast } from "svelte-sonner"
    import { Button } from "$lib/components/ui/button"

    const { nodes }: { nodes: DecisionTree } = $props()
    let isLoading = $state(false)

    function exportTemplates() {
        if (!nodes) {
            toast.error("Templates have not finished loading.")
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
                toast.error(error.message)
                isLoading = false
            })
    }
</script>

{#if isLoading}
    <Spinner />
{:else}
    <Button
        disabled={isLoading}
        class="btn preset-filled-primary-500 hover:preset-soft-primary-500"
        onclick={exportTemplates}
    >
        Export Templates
    </Button>
{/if}
