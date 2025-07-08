<!--
    A reusable data table component with sorting, filtering, and pagination capabilities.

    Props:
    @param {T[]} data - Array of objects to display in the table
    @param {(keyof T)[]} [hiddenColumns] - Optional array of column keys to hide from display
    @param {Function} [onCreate] - Optional callback function when create button is clicked
    @param {Function} [onEdit] - Optional callback function when edit button is clicked, receives row data
    @param {Function} [onDelete] - Optional callback function when delete button is clicked, receives row data

    Example:
    ```svelte
    <DataTable
        data={myData}
        hiddenColumns={['id']}
        onCreate={() => handleCreate()}
        onEdit={(row) => handleEdit(row)}
        onDelete={(row) => handleDelete(row)}
    />
    ```
-->
<script lang="ts" generics="T extends Record<string, any>">
    import { ArrowDown, ArrowDownUp, ArrowUp, Pencil, Trash } from "@lucide/svelte"
    import { flip } from "svelte/animate"

    type Props<T extends Record<string, any>> = {
        data: T[]
        idColumn: string
        hiddenColumns?: readonly (keyof T)[]
        onCreate?: () => void
        onEdit?: (row: (typeof data)[number]) => void
        onDelete?: (row: (typeof data)[number]) => void
    }

    let { data, idColumn, hiddenColumns, onCreate, onEdit, onDelete }: Props<T> = $props()

    const paginationOptions = [5, 10, 20, 50] as const
    let currentPage = $state(0)
    let nRowsPerPage: (typeof paginationOptions)[number] = $state(10)
    let sortKey: keyof T | null = $state(null)
    let sortDirection: -1 | 0 | 1 = $state(0)

    const showControls = onEdit || onDelete

    let sorted = $derived(applySort(data, sortKey, sortDirection))
    let paginated = $derived(applyPagination(sorted))
    let maxPages = $derived(Math.ceil(data.length / nRowsPerPage))

    const columns = (Object.keys(data[0]) as (keyof T)[]).filter(name => !hiddenColumns?.includes(name))

    function applySort(data: { [K in keyof T]: string }[], key: keyof T | null, direction: -1 | 0 | 1) {
        if (key === null) return data
        if (direction === 0) return data
        return data.toSorted((a, b) => (a[key].toLowerCase() > b[key].toLowerCase() ? -1 : 1) * direction)
    }

    function titleCase(str: string) {
        return str
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
    }

    function applyPagination(data: { [K in keyof T]: string }[]) {
        const skip = nRowsPerPage * currentPage
        return data.slice(skip, skip + nRowsPerPage)
    }
</script>

<div class="table-container min-w-[16rem] overflow-x-auto">
    <div class="hidden lg:block w-full overflow-x-auto">
        <table class="table caption-bottom min-w-full">
            <thead class="font-semibold">
                <tr>
                    {#if showControls}
                        <td>Controls</td>
                    {/if}
                    {#each columns as name}
                        <td class="whitespace-nowrap px-2">
                            {titleCase((name as string).replace("_", " "))}
                            <button
                                onclick={() => {
                                    sortKey = name
                                    sortDirection -= 1
                                    if (sortDirection === -2) sortDirection = 1
                                }}
                            >
                                {#if sortKey !== name || sortDirection === 0}
                                    <ArrowDownUp size="13" />
                                {:else if sortDirection === -1}
                                    <ArrowDown size="13" />
                                {:else}
                                    <ArrowUp size="13" />
                                {/if}
                            </button>
                        </td>
                    {/each}
                </tr>
            </thead>
            <tbody class="[&>tr]:hover:preset-tonal-primary">
                {#each paginated as row (row[idColumn])}
                    <tr animate:flip={{ duration: 350 }}>
                        {#if showControls}
                            <td class="px-2 min-w-[5rem]">
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
                                            <Pencil />
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
                                            <Trash />
                                        </button>
                                    {/if}
                                </div>
                            </td>
                        {/if}
                        {#each columns as column}
                            <td class="px-2 py-1 min-w-24 max-w-32 truncate"> {row[column]} </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    <div class="lg:hidden space-y-4">Page too narrow to display table.</div>
</div>
<div class="pt-2 flex w-full justify-between">
    {#if onCreate}
        <button class="btn preset-filled-primary-500" onclick={onCreate}> Create </button>
    {/if}

    <div class="space-x-2">
        {#each Array(maxPages).keys() as val}
            <button
                class:preset-filled-secondary-500={currentPage === val}
                class="btn preset-filled-primary-500"
                onclick={() => (currentPage = val)}
            >
                {val + 1}
            </button>
        {/each}
    </div>
</div>
