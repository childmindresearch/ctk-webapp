<script lang="ts">
    import { DecisionTree } from "./DecisionTree.svelte"
    import { downloadBlob } from "$lib/utils"
    import { Spinner } from "$lib/components/ui/spinner"
    import { toast } from "svelte-sonner"
    import { Button } from "$lib/components/ui/button"
    import { Packer } from "docx"
    import { exportRoot } from "./Checkout/CheckoutUtils"

    const { node }: { node: DecisionTree } = $props()
    let isLoading = $state(false)

    async function exportTemplates() {
        try {
            const doc = await exportRoot(node)
            console.log(doc)
            Packer.toBlob(doc).then(blob => {
                downloadBlob(blob, "ctk_template_export.docx")
            })
        } catch (e) {
            toast.error("Something went wrong with the export. Contact a developer.")
            console.log(e)
        }
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
