<!--
    A reusable data table component with sorting, filtering, and pagination capabilities.

    Props:
    @param {T[]} data - Array of objects to display in the table
    @param {(keyof T)[]} [hiddenColumns] - Optional array of column keys to hide from display
    @param {Function} onExport - Optional callback function when export button is clicked, receives current table data
    @param {Function} [onCreate] - Optional callback function when create button is clicked
    @param {Function} [onEdit] - Optional callback function when edit button is clicked, receives row data
    @param {Function} [onDelete] - Optional callback function when delete button is clicked, receives row data

    Example:
    ```svelte
    <DataTable
        data={myData}
        hiddenColumns={['id']}
        onExport={(data) => handleExport(data)}
        onCreate={() => handleCreate()}
        onEdit={(row) => handleEdit(row)}
        onDelete={(row) => handleDelete(row)}
    />
    ```
-->
<script lang="ts" generics="T extends Record<string, any>">
    import EditIcon from "$lib/icons/EditIcon.svelte"
    import TrashIcon from "$lib/icons/TrashIcon.svelte"
    import { TableHandler, Datatable, ThSort, ThFilter, Th } from "@vincjo/datatables"

    type Props<T> = {
        data: T[]
        hiddenColumns?: (keyof T)[]
        onExport?: (rows: typeof data) => void
        onCreate?: () => void
        onEdit?: (row: (typeof data)[number]) => void
        onDelete?: (row: (typeof data)[number]) => void
    }

    let { data, hiddenColumns, onExport, onCreate, onEdit, onDelete }: Props<T> = $props()

    const showControls = onEdit || onDelete
    const columnNames: (keyof T)[] = Object.keys(data[0])

    let table = new TableHandler(data, { rowsPerPage: 10, selectBy: "id" })
    let view = table.createView(
        columnNames.map((col, index) => {
            return {
                index: index + (showControls ? 1 : 0), // +1 to skip the controls column.
                name: col as string,
                isVisible: !hiddenColumns?.find(c => c === col)
            }
        })
    )

    const search = $derived(table.createSearch())

    function titleCase(str: string) {
        return str
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
    }
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

<Datatable {table}>
    <table>
        <thead>
            <tr>
                {#if showControls}
                    <Th><strong>Controls</strong></Th>
                {/if}
                {#each view.columns as column}
                    <ThSort {table} field={column.name as string}>
                        {titleCase((column.name as string).replace("_", " "))}
                    </ThSort>
                {/each}
            </tr>
            <tr>
                {#if showControls}
                    <Th />
                {/if}
                {#each view.columns as column}
                    <ThFilter {table} field={column.name as string} />
                {/each}
            </tr>
        </thead>

        <tbody>
            {#each table.rows as row}
                <tr>
                    {#if showControls}
                        <td>
                            <div class="text-center space-x-2">
                                <button
                                    aria-label="edit"
                                    class="text-warning-600 hover:text-warning-300 transition-colors duration-150"
                                    onclick={() => {
                                        if (onEdit) {
                                            // @ts-ignore
                                            onEdit(row)
                                        }
                                    }}
                                >
                                    <EditIcon />
                                </button>
                                <button
                                    aria-label="delete"
                                    class="text-error-600 hover:text-error-300 transition-colors duration-150"
                                    onclick={() => {
                                        if (onDelete) {
                                            // @ts-ignore
                                            onDelete(row)
                                        }
                                    }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </td>
                    {/if}
                    {#each columnNames as column}
                        <td>
                            {// @ts-ignore
                            row[column]}
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</Datatable>

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
</div>
