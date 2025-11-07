<script lang="ts">
    import { File } from "lucide-svelte"
    import { DecisionTree } from "../DecisionTree.svelte"
    import { toast } from "svelte-sonner"
    import type { Editor } from "@tiptap/core"
    import * as Dialog from "$lib/components/ui/dialog"
    import CTKEditor from "$lib/components/CTKEditor.svelte"
    import { Button } from "$lib/components/ui/button"
    import Spinner from "$lib/components/ui/spinner/spinner.svelte"

    type Props = {
        node: DecisionTree
    }
    let { node }: Props = $props()
    let html = $state("")
    let isLoading = $state(false)
    let dialogOpen = $state(false)

    function updateContents(editor: Editor) {
        try {
            html = editor.getHTML()
        } catch {
            toast.error("Something went wrong with interpreting this template. Please contact a developer.")
        }
    }

    async function onSubmit() {
        if (!html) return
        isLoading = true
        await fetch(`/api/templates/${node.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: html })
        })
            .then(res => {
                if (!res.ok) {
                    toast.error(`Failed to create the template: ${res.statusText}`)
                } else {
                    return res.json()
                }
            })
            .then(newNodes => {
                const newNode = newNodes[0]
                const newChild = new DecisionTree([newNode], newNode.id, node)
                node = node.addChild(newChild)
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
            class="h-8 w-8 text-primary hover:bg-primary/10"
            aria-label="Create template"
        >
            <File />
        </Button>
    </Dialog.Trigger>
    <Dialog.Content class="min-w-[1024px] min-h-[800px] space-y-0 gap-0">
        <Dialog.Header>
            <Dialog.Title>Create new template</Dialog.Title>
            <Dialog.Description>For template values, press the insert button.</Dialog.Description>
        </Dialog.Header>
        <CTKEditor content="" onTransaction={updateContents} />
        <Dialog.Footer>
            {#if isLoading}
                <Spinner />
            {:else}
                <Button type="submit" onclick={onSubmit}>Save changes</Button>
            {/if}
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>
