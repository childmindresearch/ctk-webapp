<script lang="ts">
    import type { TableHandler } from "@vincjo/datatables"

    type Props = {
        table: TableHandler
    }

    let { table }: Props = $props()
</script>

<div class="flex space-x-1 ml-auto">
    <p class="my-auto">Showing {table.rowCount.start} to {table.rowCount.end} of {table.rowCount.total} rows</p>
    {#each table.pagesWithEllipsis as page}
        <button
            onclick={() => table.setPage(page)}
            class="btn {page === table.currentPage ? 'bg-primary-300' : 'bg-surface-800'}"
            type="button">{page ?? "..."}</button
        >
    {/each}
</div>
