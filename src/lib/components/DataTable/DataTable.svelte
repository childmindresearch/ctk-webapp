<!--
    A reusable data table component with sorting, filtering, and pagination capabilities.

    Props:
    @param {T[]} data - Array of objects to display in the table
    @param {(keyof T)[]} [hiddenColumns] - Optional array of column keys to hide from display
    @param {Function} onExport - Optional callback function when export button is clicked, receives current table data
    @param {Function} [onCreate] - Optional callback function when create button is clicked
    @param {Function} [onEdit] - Optional callback function when edit button is clicked, receives row data
    @param {Function} [onDelete] - Optional callback function when delete button is clicked, receives row data
    @param {Function} [unpack] - Optional function uses to process row data into strings.

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
    import { TableHandler, Datatable, ThSort, Th } from "@vincjo/datatables"
    import DataTableHeader from "./DataTableHeader.svelte"
    import DataTableFooter from "./DataTableFooter.svelte"
    import DataTableControls from "./DataTableControls.svelte"

    type Props<T> = {
        data: T[]
        hiddenColumns?: (keyof T)[]
        onExport?: (rows: typeof data) => void
        onCreate?: () => void
        onEdit?: (row: (typeof data)[number]) => void
        onDelete?: (row: (typeof data)[number]) => void
        unpack?: (value: any) => { [key: string]: string }
    }

    let { data, hiddenColumns, onExport, onCreate, onEdit, onDelete, unpack }: Props<T> = $props()

    const showControls = onEdit || onDelete
    const columnNames: (keyof T)[] = Object.keys(data[0])

    let unpacked = unpack ? data.map(unpack) : data

    let table = new TableHandler(unpacked, { rowsPerPage: 10, selectBy: "id" })
    let view = table.createView(
        columnNames.map((col, index) => {
            return {
                index: index + (showControls ? 1 : 0), // +1 to skip the controls column.
                name: col as string,
                isVisible: !hiddenColumns?.find(c => c === col)
            }
        })
    )

    function titleCase(str: string) {
        return str
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
    }
</script>

<DataTableHeader {table} />

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
        </thead>

        <tbody>
            {#each table.rows as row}
                <tr>
                    {#if showControls}
                        <td>
                            <div class="text-center space-x-2">
                                {#if onEdit}
                                    <button
                                        aria-label="edit"
                                        class="text-warning-600 hover:text-warning-300 transition-colors duration-150"
                                        onclick={() => {
                                            // @ts-expect-error id does exist on row.
                                            const selectedRow = data.find(value => value["id"] == row.id)
                                            if (!selectedRow) return
                                            onEdit(selectedRow)
                                        }}
                                    >
                                        <EditIcon />
                                    </button>
                                {/if}
                                {#if onDelete}
                                    <button
                                        aria-label="delete"
                                        class="text-error-600 hover:text-error-300 transition-colors duration-150"
                                        onclick={() => {
                                            onDelete(row)
                                        }}
                                    >
                                        <TrashIcon />
                                    </button>
                                {/if}
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

<DataTableControls {table} {onCreate} {onExport} />
<DataTableFooter {table} />
