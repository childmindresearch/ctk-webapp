<script lang="ts">
    import { PostTemplate } from "$api/v1"
    import CTKEditor from "$lib/components/CTKEditor.svelte"
    import { Button } from "$lib/shadcn/components/ui/button"
    import * as Dialog from "$lib/shadcn/components/ui/dialog"
    import Spinner from "$lib/shadcn/components/ui/spinner/spinner.svelte"
    import { FetchError } from "$lib/utils"
    import type { Editor } from "@tiptap/core"
    import { File } from "lucide-svelte"
    import { toast } from "svelte-sonner"
    import { DecisionTree } from "../DecisionTree.svelte"

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
        const result = await PostTemplate.fetch({
            pathArgs: [node.id],
            body: { text: html }
        })
        if (result instanceof FetchError) {
            toast.error(`Failed to create the template: ${result.message}`)
        } else {
            console.log(result)
            const newChild = new DecisionTree([result], result.id, node)
            node = node.addChild(newChild)
        }
        console.log(dialogOpen, isLoading)
        dialogOpen = false
        isLoading = false
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
