<script lang="ts">
    import { DecisionTree } from "../DecisionTree.svelte"
    import { toaster } from "$lib/utils"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import ModalMarkdown from "$lib/components/ModalMarkdown.svelte"
    import { Pencil } from "@lucide/svelte"

    type Props = {
        node: DecisionTree
    }
    let { node }: Props = $props()
    let isModalOpen = $state(false)

    const instructions = `To add a template value, write it in all caps with dashes for spaces
        between two curly brackets. For example: {{CHILD-NAME}} could be used
        as a template for a child's name. Templates values with an ! (e.g. {{!SYMPTOM_FREQUENCY}})
        will be left in the Word document, marked in red. Pronouns may also be added with {{PRONOUN-0}}
        through {{PRONOUN-4}} representing "he/she, him/her, his/her, his/hers, himself/herself".
        Please conjugate verbs associated with these pronouns in the singular.`

    async function onSubmit(text: string) {
        const parentId = node.parent ? node.parent.id : null

        if (!text) return
        await fetch(`/api/templates/${node.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, parentId, priority: node.priority })
        }).then(result => {
            if (!result.ok) {
                toaster.error({
                    title: `Failed to edit the template: ${result.statusText}`
                })
                return
            }
            node.text = text
        })
        isModalOpen = false
    }
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase=""
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <Pencil class="text-warning-600 hover:text-warning-400" size="1.3rem" />
    {/snippet}
    {#snippet content()}
        <ModalMarkdown text={node.text} {onSubmit} {instructions} />
    {/snippet}
</Modal>
