<script lang="ts">
  import { shortenText } from "$lib/utils"
  import { DecisionTree } from "../DecisionTree.svelte"
  import { openNodeIds } from "./store"
  import { Trash } from "lucide-svelte"
  import * as AlertDialog from "$lib/components/ui/alert-dialog"
  import { Button } from "$lib/components/ui/button"
  import { toast } from "svelte-sonner"

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
    await fetch(`/api/templates/${node.id}`, { method: "DELETE" }).then(response => {
      if (!response.ok) {
        toast.error("Failed to delete the template: " + response.statusText)
      } else if (!node.parent) {
        toast.error("Cannot delete the root node.")
      } else {
        const parent = node.parent
        openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
        parent.deleteChild(node.id)
        toast.success("Template deleted successfully")
      }
    })
    modalClose()
  }
</script>

<AlertDialog.Root bind:open={isModalOpen}>
  <AlertDialog.Trigger>
    <Button
      variant="ghost"
      size="icon"
      class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
      aria-label="Delete template"
    >
      <Trash class="h-4 w-4" />
    </Button>
  </AlertDialog.Trigger>

  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete Template</AlertDialog.Title>
      <AlertDialog.Description>
        Are you sure you want to delete
        <span class="font-semibold">{shortenText(node.text)}</span>? This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>

    <AlertDialog.Footer>
      <AlertDialog.Cancel>
        <Button variant="outline">Cancel</Button>
      </AlertDialog.Cancel>
      <AlertDialog.Action>
        <Button variant="destructive">Delete</Button>
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
