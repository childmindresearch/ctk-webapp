<script lang="ts">
    import EditIcon from "$lib/icons/EditIcon.svelte"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { DecisionTree } from "../DecisionTree.svelte"

    type Props = {
        node: DecisionTree
    }
    let { node }: Props = $props()

    const modalStore = getModalStore()
    const toastStore = getToastStore()

    const instructions = `To add a template value, write it in all caps with dashes for spaces
        between two curly brackets. For example: {{CHILD-NAME}} could be used
        as a template for a child's name. Templates values with an ! (e.g. {{!SYMPTOM_FREQUENCY}})
        will be left in the Word document, marked in red. Pronouns may also be added with {{PRONOUN-0}}
        through {{PRONOUN-4}} representing "he/she, him/her, his/her, his/hers, himself/herself".
        Please conjugate verbs associated with these pronouns in the singular.`

    async function onEdit() {
        const parentId = node.parent ? node.parent.id : null
        const modal: ModalSettings = {
            type: "component",
            component: "markdown",
            title: `Edit template`,
            meta: { instructions: instructions, value: node.text },
            response: async response => {
                if (!response) return
                await fetch(`/api/templates/${node.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: response.value, parentId, priority: node.priority })
                }).then(result => {
                    if (!result.ok) {
                        toastStore.trigger({
                            message: `Failed to edit the template: ${result.statusText}`,
                            background: "variant-filled-error"
                        })
                        return
                    }
                    node.text = response.value
                })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<button onclick={onEdit} class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem]">
    <EditIcon class="text-warning-600" />
</button>
