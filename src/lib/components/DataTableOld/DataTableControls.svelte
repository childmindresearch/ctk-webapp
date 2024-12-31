<script lang="ts">
    import type { TableHandler } from "@vincjo/datatables"

    type Props = {
        table: TableHandler
        onExport?: (rows: any) => void
        onCreate?: () => void
    }

    const { table, onCreate, onExport }: Props = $props()
</script>

<div class="mt-1 w-full flex">
    <div class="space-x-1">
        {#if onCreate}
            <button aria-label="create" class="btn variant-filled-primary" onclick={onCreate}> Create </button>
        {/if}
        {#if onExport}
            <button
                aria-label="export"
                class="btn variant-filled-primary"
                onclick={() => {
                    // @ts-ignore
                    onExport([...table.allRows])
                }}
            >
                Export
            </button>
        {/if}
    </div>
</div>
