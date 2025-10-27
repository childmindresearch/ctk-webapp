<script lang="ts">
    import { toast } from "svelte-sonner"
    import { DecisionTree } from "../DecisionTree.svelte"

    type Props = {
        node: DecisionTree
    }
    let { node }: Props = $props()

    // Re-enable when adding tiptap
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function onSubmit(text: string) {
        const parentId = node.parent ? node.parent.id : null

        if (!text) return
        await fetch(`/api/templates/${node.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, parentId, priority: node.priority })
        }).then(result => {
            if (!result.ok) {
                toast.error(`Failed to edit the template: ${result.statusText}`)
                return
            }
            node.text = text
        })
    }
</script>
