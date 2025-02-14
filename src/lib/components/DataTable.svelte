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
    import DataTableHeader from "./DataTableOld/DataTableHeader.svelte"
    import DataTableFooter from "./DataTableOld/DataTableFooter.svelte"
    import DataTableControls from "./DataTableOld/DataTableControls.svelte"
    import { flip } from "svelte/animate"

    type Props<T extends Record<string, any>> = {
        data: T[]
        hiddenColumns?: readonly (keyof T)[]
        onExport?: (rows: typeof data) => void
        onCreate?: () => void
        onEdit?: (row: (typeof data)[number]) => void
        onDelete?: (row: (typeof data)[number]) => void
        unpack?: (value: T) => { [K in keyof T]: string }
    }

    function defaultUnpack<T extends Record<string, unknown>>(row: T) {
        return Object.fromEntries(
            Object.entries(row).map(entry => {
                const [key, value] = entry
                return [key, String(value)]
            })
        ) as { [K in keyof T]: string }
    }

    const { data, hiddenColumns, onExport, onCreate, onEdit, onDelete, unpack = defaultUnpack }: Props<T> = $props()

    const paginationOptions = [5, 10, 20, 50] as const
    let currentPage = $state(0)
    let nRowsPerPage: (typeof paginationOptions)[number] = $state(10)

    const showControls = onEdit || onDelete

    let globalSearch = $state("")
    let searched = $derived(applyFilters(data))
    let paginated = $derived(applyPagination(searched))
    let maxPages = $derived(Math.ceil(searched.length / nRowsPerPage))

    const columns = (Object.keys(data[0]) as (keyof T)[]).filter(name => !hiddenColumns?.includes(name))

    function titleCase(str: string) {
        return str
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
    }

    function applyFilters(data: T[]) {
        let selected = data.map(unpack)

        // Search
        if (globalSearch) {
            selected = selected.filter(row => {
                const rowString = Object.values(row).reduce(
                    (accumulator, value) => accumulator + " " + String(value),
                    ""
                )
                return rowString.includes(globalSearch)
            })
        }
        return selected
    }

    function applyPagination(data: { [K in keyof T]: string }[]) {
        const skip = nRowsPerPage * currentPage
        return data.slice(skip, skip + nRowsPerPage)
    }
</script>

<div class="pb-2">
    <input class="input max-w-96" type="search" bind:value={globalSearch} placeholder="Search" />
    <select bind:value={nRowsPerPage}>
        {#each paginationOptions as num}
            <option value={num}>{num}</option>
        {/each}
    </select>
</div>
<table class="table table-hover overflow-x-auto">
    <thead>
        <tr>
            {#if showControls}
                <td>Controls</td>
            {/if}
            {#each columns as name}
                <td>{titleCase((name as string).replace("_", " "))}</td>
            {/each}
        </tr>
    </thead>

    <tbody>
        {#each paginated as row (row.id)}
            <tr animate:flip={{ duration: 200 }}>
                {#if showControls}
                    <td>
                        <div class="text-center space-x-2">
                            {#if onEdit}
                                <button
                                    aria-label="edit"
                                    class="text-warning-600 hover:text-warning-300 transition-colors duration-150"
                                    onclick={() => {
                                        const target = data.find(dataRow => dataRow.id == row.id)
                                        if (target) onEdit(target)
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
                                        const target = data.find(dataRow => dataRow.id == row.id)
                                        if (target) onDelete(target)
                                    }}
                                >
                                    <TrashIcon />
                                </button>
                            {/if}
                        </div>
                    </td>
                {/if}
                {#each columns as column}
                    <td> {row[column]} </td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

<div class="pt-2 flex w-full justify-between">
    {#if onCreate}
        <button class="btn variant-filled-primary" onclick={onCreate}>
            Create
        </button>
    {/if}

    <div class="space-x-2">
        {#each Array(maxPages).keys() as val}
            <button
                class:variant-filled-secondary={currentPage === val}
                class="btn variant-filled-primary"
                onclick={() => (currentPage = val)}
            >
                {val + 1}
            </button>
        {/each}
    </div>
</div>
