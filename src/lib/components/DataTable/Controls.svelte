<script lang="ts">
    import { Pencil, Trash } from "lucide-svelte"
    import { Button } from "$lib/shadcn/components/ui/button"

    type Props = {
        onEdit?: () => void
        onDelete?: () => void
    }

    let { onEdit, onDelete }: Props = $props()
</script>

<div class="flex items-center justify-center gap-2">
    {#if onEdit}
        <Button
            variant="ghost"
            size="icon"
            aria-label="Edit"
            onclick={onEdit}
            class="h-8 w-8 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200"
        >
            <Pencil class="h-4 w-4" />
        </Button>
    {/if}
    {#if onDelete}
        <Button
            variant="ghost"
            size="icon"
            aria-label="Delete"
            onclick={onDelete}
            class="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-200"
        >
            <Trash class="h-4 w-4" />
        </Button>
    {/if}
</div>
