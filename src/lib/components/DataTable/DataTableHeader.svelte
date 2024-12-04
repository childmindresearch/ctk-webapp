<script lang="ts">
    import type { TableHandler } from "@vincjo/datatables"

    type Props = {
        table: TableHandler
    }
    let { table }: Props = $props()

    const search = $derived(table.createSearch())
</script>

<div class="mb-1 w-full flex">
    <input
        class="input max-w-48"
        type="text"
        placeholder="Search"
        bind:value={search.value}
        oninput={() => search.set()}
    />
    <div class="ml-auto">
        Rows per page
        <select class="select w-16" bind:value={table.rowsPerPage} onchange={() => table.setPage(1)}>
            {#each [5, 10, 20, 50] as option}
                <option value={option}>{option}</option>
            {/each}
        </select>
    </div>
</div>
