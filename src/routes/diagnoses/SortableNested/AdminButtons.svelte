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

    const instructions =
        "To add a template value, write it in all caps with underscores for spaces between two curly brackets. For example: {{CHILD_NAME}} could be used as a template for a child's name."

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
            title: `New diagnosis inside "${shortenText(node.text)}"`,
            meta: { instructions: instructions },
            response: async response => {
                if (!response.value) return
                await fetch(`/api/templates/${node.id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: response.value })
                })
                    .then(res => res.json())
                    .then(newNode => {
                        node.children = node.children.concat(new DecisionTree([newNode], newNode.id, node))
                    })
                    .catch(console.error)
            }
        }
        modalStore.trigger(modal)
    }

    async function onEdit() {
        const parentId = node.parent ? node.parent.id : null
        const modal: ModalSettings = {
            type: "component",
            component: "markdown",
            title: `Edit diagnosis "${shortenText(node.text)}"`,
            meta: { instructions: instructions, value: node.text },
            response: async response => {
                if (!response) return
                await fetch(`/api/templates/${node.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text: response.value, parentId })
                })
                    .then(() => (node.text = response.value))
                    .catch(console.error)
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
            title: "Delete diagnosis",
            body: `Are you sure you want to delete "${shortenText(node.text)}" and any subdirectories?`,
            response: async value => {
                if (!value) return
                await fetch(`/api/templates/${node.id}`, { method: "DELETE" }).then(() => {
                    if (!node.parent) {
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

<span class={"space-x-2"}>
    {#each adminButtons as adminButton}
        <button on:click={adminButton.onClick} hidden={!adminButton.show} class="hover-highlight">
            <svelte:component this={adminButton.icon} class={adminButton.class} />
        </button>
    {/each}
</span>
