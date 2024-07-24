<script lang="ts">
    import EditIcon from "$lib/icons/EditIcon.svelte"
    import FileIcon from "$lib/icons/FileIcon.svelte"
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import { shortenText } from "$lib/utils"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { DecisionTree } from "../DecisionTree"

    export let node: DecisionTree
    export let showCreate = true
    export let showEdit = true
    export let showDelete = true

    const modalStore = getModalStore()
    const toastStore = getToastStore()

    const instructions = `To add a template value, write it in all caps with dashes for spaces
        between two curly brackets. For example: {{CHILD-NAME}} could be used
        as a template for a child's name. Templates values with an ! (e.g. {{!SYMPTOM_FREQUENCY}})
        will be left in the Word document, marked in red. Pronouns may also be added with {{PRONOUN-0}}
        through {{PRONOUN-4}} representing "he/she, him/her, his/her, his/hers, himself/herself".
        Please conjugate verbs associated with these pronouns in the singular.`

    const adminButtons = [
        {
            icon: FileIcon,
            class: "text-success-600",
            onClick: onCreate,
            show: showCreate
        },
        {
            icon: EditIcon,
            class: "text-warning-600",
            onClick: onEdit,
            show: showEdit
        },
        {
            icon: TrashIcon,
            class: "text-error-600",
            onClick: onDelete,
            show: showDelete
        }
    ]

    async function onCreate() {
        const modal: ModalSettings = {
            type: "component",
            component: "markdown",
            title: `New template inside "${shortenText([...node.getPath(), node.text].join(" | "))}"`,
            meta: { instructions: instructions, value: "" },
            response: async response => {
                if (!response.value) return
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
                        node.children = node.children.concat(new DecisionTree([newNode], newNode.id, node))
                    })
            }
        }
        modalStore.trigger(modal)
    }

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
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: response.value, parentId })
                }).then(result => {
                    if (!result.ok) {
                        toastStore.trigger({
                            message: `Failed to edit the template: ${result.statusText}`,
                            background: "variant-filled-error"
                        })
                    }
                    node.text = response.value
                })
            }
        }
        modalStore.trigger(modal)
    }

    async function onDelete() {
        if (!node.parent) {
            toastStore.trigger({ message: "Cannot delete the root node.", background: "variant-filled-error" })
            return
        }
        const modal: ModalSettings = {
            type: "confirm",
            title: "Delete template",
            body: `Are you sure you want to delete "${shortenText(node.text)}" and any subdirectories?`,
            response: async value => {
                if (!value) return
                await fetch(`/api/templates/${node.id}`, { method: "DELETE" }).then(response => {
                    if (!response.ok) {
                        toastStore.trigger({
                            message: "Failed to delete the template: " + response.statusText,
                            background: "variant-filled-error"
                        })
                    } else if (!node.parent) {
                        toastStore.trigger({
                            message: "Cannot delete the root node.",
                            background: "variant-filled-error"
                        })
                    } else {
                        node.parent.children = node.parent.children.filter(child => child.id !== node.id)
                    }
                })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<span class="grid grid-rows-1 grid-flow-col gap-0">
    {#each adminButtons as adminButton}
        <button
            on:click={adminButton.onClick}
            hidden={!adminButton.show}
            class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem]"
        >
            <svelte:component this={adminButton.icon} class={adminButton.class} />
        </button>
    {/each}
</span>
