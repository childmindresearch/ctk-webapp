<script lang="ts">
    import { Pencil } from "lucide-svelte"
    import * as Dialog from "$lib/components/ui/dialog"
    import CTKEditor from "$lib/components/CTKEditor.svelte"
    import { Button } from "$lib/components/ui/button"
    import { toast } from "svelte-sonner"
    import { DecisionTree } from "../DecisionTree.svelte"
    import type { Editor } from "@tiptap/core"
    import { Spinner } from "$lib/components/ui/spinner"

    type Props = {
        node: DecisionTree
    }
    let { node }: Props = $props()
    let html = $state(node.text)
    let isLoading = $state(false)
    let dialogOpen = $state(false)

    function updateContents(editor: Editor) {
        html = editor.getHTML()
    }

    async function onSubmit() {
        const parentId = node.parent ? node.parent.id : null

        if (!html) return
        isLoading = true
        await fetch(`/api/templates/${node.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: html, parentId, priority: node.priority })
        })
            .then(result => {
                if (!result.ok) {
                    toast.error(`Failed to edit the template: ${result.statusText}`)
                    return
                }
                node.text = html
                dialogOpen = false
            })
            .finally(() => {
                isLoading = false
            })
    }
</script>

<Dialog.Root bind:open={dialogOpen}>
    <Dialog.Trigger>
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 text-secondary-foreground hover:bg-secondary-foreground/10"
            aria-label="Create template"
        >
            <Pencil />
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="min-w-[1024px] min-h-[800px] space-y-0 gap-0">
        <Dialog.Header>
            <Dialog.Title>Edit a template</Dialog.Title>
            <Dialog.Description>For template values, press the insert button.</Dialog.Description>
        </Dialog.Header>
        <CTKEditor content={node.text} onTransaction={updateContents} />
        <Dialog.Footer>
            {#if isLoading}
                <Spinner />
            {:else}
                <Button type="submit" onclick={onSubmit}>Save changes</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
