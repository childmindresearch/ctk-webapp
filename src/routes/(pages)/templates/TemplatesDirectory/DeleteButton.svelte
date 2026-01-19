<script lang="ts">
    import { DeleteTemplate } from "$api/v1/templates/[id]"
    import * as AlertDialog from "$lib/shadcn/components/ui/alert-dialog"
    import { Button } from "$lib/shadcn/components/ui/button"
    import { FetchError, shortenText } from "$lib/utils"
    import { Trash } from "lucide-svelte"
    import sanitizeHtml from "sanitize-html"
    import { toast } from "svelte-sonner"
    import { DecisionTree } from "../DecisionTree.svelte"
    import { openNodeIds } from "./store"

    type Props = {
        node: DecisionTree
    }

    let { node }: Props = $props()

    let isModalOpen = $state(false)
    const deleteText = shortenText(sanitizeHtml(node.text, { allowedTags: [] }))
    function modalClose() {
        isModalOpen = false
    }

    async function onDelete() {
        const result = await DeleteTemplate.fetch({ pathArgs: [node.id] })
        if (result instanceof FetchError) {
            toast.error("Failed to delete the template: " + result.message)
        } else if (!node.parent) {
            toast.error("Cannot delete the root node.")
        } else {
            const parent = node.parent
            openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
            parent.deleteChild(node.id)
            toast.success("Template deleted successfully")
        }
        modalClose()
    }
</script>

<AlertDialog.Root bind:open={isModalOpen}>
    <AlertDialog.Trigger>
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete template"
        >
            <Trash class="h-4 w-4" />
        </Button>
    </AlertDialog.Trigger>

    <AlertDialog.Content>
        <AlertDialog.Header>
            <AlertDialog.Title>Delete Template</AlertDialog.Title>
            <AlertDialog.Description>
                Are you sure you want to delete
                <span class="font-semibold">{deleteText}</span>? This action cannot be undone.
            </AlertDialog.Description>
        </AlertDialog.Header>

        <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onclick={onDelete}>Delete</AlertDialog.Action>
        </AlertDialog.Footer>
    </AlertDialog.Content>
</AlertDialog.Root>
