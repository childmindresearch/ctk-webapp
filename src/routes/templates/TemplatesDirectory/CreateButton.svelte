<script lang="ts">
    import FileIcon from "$lib/icons/FileIcon.svelte"
    import { shortenText } from "$lib/utils"
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

    async function localOnCreate() {
        const modal: ModalSettings = {
            type: "component",
            component: "markdown",
            title: `New template inside "${shortenText([...node.getPath(), node.text].join(" | "))}"`,
            meta: { instructions: instructions, value: "" },
            response: async response => {
                if (response === undefined || !response.value) return
                await fetch(`/api/templates/${node.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: response.value })
                })
                    .then(res => {
                        if (!res.ok) {
                            toastStore.trigger({
                                message: `Failed to create the template: ${res.statusText}`,
                                background: "variant-filled-error"
                            })
                        } else {
                            return res.json()
                        }
                    })
                    .then(newNode => {
                        const newChild = new DecisionTree([newNode], newNode.id, node)
                        node = node.addChild(newChild)
                    })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<button onclick={localOnCreate} class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem]">
    <FileIcon class="text-success-600" />
</button>
