<script lang="ts">
    import { shortenText } from "$lib/utils"
    import { DecisionTree } from "../DecisionTree.svelte"
    import { openNodeIds } from "./store"
    import { toaster } from "$lib/utils"
    import { Trash } from "@lucide/svelte"

    type Props = {
        node: DecisionTree
        ondelete?: () => void
    }
    let { node }: Props = $props()

    let isModalOpen = $state(false)

    function modalClose() {
        isModalOpen = false
    }

    async function onDelete() {
        const confirmed = confirm(`Are you sure you wish to delete node ${shortenText(node.text)}?`)
        if (!confirmed) return
        await fetch(`/api/templates/${node.id}`, { method: "DELETE" }).then(response => {
            if (!response.ok) {
                toaster.error({
                    title: "Failed to delete the template: " + response.statusText
                })
            } else if (!node.parent) {
                toaster.error({
                    title: "Cannot delete the root node."
                })
            } else {
                const parent = node.parent
                openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
                parent.deleteChild(node.id)
            }
        })
        modalClose()
    }
</script>

<!-- Add bottom padding to align well with Skeleton Modals.-->
<button class="pb-[6px]" type="button" onclick={onDelete}>
    <Trash class="text-error-600 hover:text-error-400" size="1.3rem" />
</button>
