<script lang="ts">
    import { EdraEditor, EdraToolBar } from "$lib/components/edra/shadcn/index.js"
    import type { Editor } from "svelte-tiptap"

    type Props = {
        content: string
        onTransaction: (editor: Editor) => void
    }

    let { content, onTransaction }: Props = $props()

    let editor = $state<Editor>()

    function onUpdate() {
        if (editor === undefined) return
        onTransaction(editor)
    }
</script>

<div class="bg-background z-50 size-full max-w-5xl rounded-md border border-dashed">
    {#if editor !== undefined}
        <EdraToolBar
            class="bg-secondary/50 flex w-full items-center overflow-x-auto border-b border-dashed p-0.5"
            {editor}
            excludedCommands={["media"]}
        />
    {/if}
    <EdraEditor bind:editor {content} class="h-[30rem] max-h-screen overflow-y-scroll pr-2 pl-6" {onUpdate} />
</div>
