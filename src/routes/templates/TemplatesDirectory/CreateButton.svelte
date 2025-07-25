<script lang="ts">
    import ModalMarkdown from "$lib/components/ModalMarkdown.svelte"
    import { File } from "@lucide/svelte"
    import { toaster } from "$lib/utils"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import { DecisionTree } from "../DecisionTree.svelte"

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
        if (!text) return
        await fetch(`/api/templates/${node.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        })
            .then(res => {
                if (!res.ok) {
                    toaster.error({
                        title: `Failed to create the template: ${res.statusText}`
                    })
                } else {
                    return res.json()
                }
            })
            .then(newNode => {
                const newChild = new DecisionTree([newNode], newNode.id, node)
                node = node.addChild(newChild)
            })
        isModalOpen = false
    }
</script>

<Modal
    open={isModalOpen}
    onOpenChange={e => (isModalOpen = e.open)}
    triggerBase=""
    contentBase="card p-4 space-y-4"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet trigger()}
        <File class="text-success-600 hover:text-success-400 bg-surface-50" size="1.3rem" />
    {/snippet}
    {#snippet content()}
        <ModalMarkdown text="" {onSubmit} {instructions} />
    {/snippet}
</Modal>
