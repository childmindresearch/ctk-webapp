<script lang="ts">
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import { shortenText } from "$lib/utils"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { DecisionTree } from "../DecisionTree.svelte"
    import { openNodeIds } from "./store"

    type Props = {
        node: DecisionTree
        ondelete?: () => void
    }
    let { node }: Props = $props()

    const modalStore = getModalStore()
    const toastStore = getToastStore()

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
                        const parent = node.parent
                        openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
                        parent.deleteChild(node.id)
                    }
                })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<button onclick={onDelete} class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem]">
    <TrashIcon class="text-error-600" />
</button>
