<script lang="ts">
    import { DecisionTree } from "../DecisionTree.svelte"
    import { toast } from "svelte-sonner"

    type Props = {
        node: DecisionTree
    }
    let { node }: Props = $props()

    // re-enable when adding tiptap.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function onSubmit(text: string) {
        if (!text) return
        await fetch(`/api/templates/${node.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        })
            .then(res => {
                if (!res.ok) {
                    toast.error(`Failed to create the template: ${res.statusText}`)
                } else {
                    return res.json()
                }
            })
            .then(newNode => {
                const newChild = new DecisionTree([newNode], newNode.id, node)
                node = node.addChild(newChild)
            })
    }
</script>
