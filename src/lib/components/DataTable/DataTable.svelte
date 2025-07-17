<!--@component
    A reusable data table component with sorting, filtering, and pagination capabilities.
    ## Props
    - data: The data to display in the table.
    - idColumn: The column name of the unique identifier.
    - hiddenColumns: Columns to hide in the table.
    - searchableColumns: Columns to include in search (defaults to all visible columns).
    - onCreate: Function to execute on clicking the Create button.
    - onEdit: Function to execute on clicking the Edit button.
    - onDelete: Function to execute on clicking the Delete button.
    ## Example
    ```svelte
    <DataTable
        data={myData}
        hiddenColumns={['id']}
        searchableColumns={['name', 'email']}
        onCreate={() => handleCreate()}
        onEdit={(row) => handleEdit(row)}
        onDelete={(row) => handleDelete(row)}
    />
    ```
-->
<script lang="ts" generics="T extends Record<string, any>">
    type Props<T extends Record<string, any>> = {
        data: T[]
        idColumn: string
        hiddenColumns?: readonly (keyof T)[]
        searchableColumns?: readonly (keyof T)[]
        onCreate?: () => void
        onEdit?: (row: (typeof data)[number]) => void
        onDelete?: (row: (typeof data)[number]) => void
    }
    import {
        ArrowDown,
        ArrowDownUp,
        ArrowUp,
        ChevronLeft,
        ChevronRight,
        ChevronsLeft,
        ChevronsRight,
        Search,
        X
    } from "@lucide/svelte"
    import { flip } from "svelte/animate"
    import Controls from "./Controls.svelte"

    let { data, idColumn, hiddenColumns, searchableColumns, onCreate, onEdit, onDelete }: Props<T> = $props()

    const paginationOptions = [5, 10, 20, 50] as const
    let currentPage = $state(0)
    let nRowsPerPage: (typeof paginationOptions)[number] = $state(10)
    let sortKey: keyof T | null = $state(null)
    let sortDirection: -1 | 0 | 1 = $state(0)
    let searchQuery = $state("")

    const showControls = onEdit || onDelete

    const columns = (Object.keys(data[0]) as (keyof T)[]).filter(name => !hiddenColumns?.includes(name))
    const columnsToSearch = searchableColumns || columns

    let filtered = $derived(applySearch(data, searchQuery))
    let sorted = $derived(applySort(filtered, sortKey, sortDirection))
    let paginated = $derived(applyPagination(sorted))
    let maxPages = $derived(Math.ceil(sorted.length / nRowsPerPage))
    let startIndex = $derived(currentPage * nRowsPerPage + 1)
    let endIndex = $derived(Math.min((currentPage + 1) * nRowsPerPage, sorted.length))

    // Reset to first page when search query changes, page size changes, or data changes
    $effect(() => {
        currentPage = 0
    })

    $effect(() => {
        if (currentPage >= maxPages && maxPages > 0) {
            currentPage = Math.max(0, maxPages - 1)
        }
    })

    function applySearch(data: { [K in keyof T]: any }[], query: string) {
        if (!query.trim()) return data

        const lowerQuery = query.toLowerCase().trim()
        return data.filter(row => {
            return columnsToSearch.some(column => {
                const value = row[column]
                if (value == null) return false
                return String(value).toLowerCase().includes(lowerQuery)
            })
        })
    }

    function applySort(data: { [K in keyof T]: any }[], key: keyof T | null, direction: -1 | 0 | 1) {
        if (key === null) return data
        if (direction === 0) return data
        return data.toSorted((a, b) => {
            const aVal = String(a[key]).toLowerCase()
            const bVal = String(b[key]).toLowerCase()
            return (aVal > bVal ? -1 : aVal < bVal ? 1 : 0) * direction
        })
    }

    function titleCase(str: string) {
        return str
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
    }

    function applyPagination(data: { [K in keyof T]: any }[]) {
        const skip = nRowsPerPage * currentPage
        return data.slice(skip, skip + nRowsPerPage)
    }

    function createRowCallback(callback: typeof onEdit | typeof onDelete, rowId: string) {
        if (!callback) return undefined
        return () => {
            const target = data.find(dataRow => dataRow.id === rowId)
            if (target) callback(target)
        }
    }

    function goToFirstPage() {
        currentPage = 0
    }

    function goToPreviousPage() {
        if (currentPage > 0) currentPage--
    }

    function goToNextPage() {
        if (currentPage < maxPages - 1) currentPage++
    }

    function goToLastPage() {
        currentPage = maxPages - 1
    }

    function clearSearch() {
        searchQuery = ""
    }

    function getVisiblePages() {
        const totalPages = maxPages
        const current = currentPage
        const delta = 2 // Number of pages to show on each side of current page

        if (totalPages <= 7) {
            // Show all pages if total is small
            return Array.from({ length: totalPages }, (_, i) => i)
        }

        let start = Math.max(0, current - delta)
        let end = Math.min(totalPages - 1, current + delta)

        // Adjust if we're near the beginning or end
        if (current <= delta) {
            end = Math.min(totalPages - 1, 4)
        }
        if (current >= totalPages - delta - 1) {
            start = Math.max(0, totalPages - 5)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }
</script>

<!-- Search Bar -->
<div class="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
    <div class="relative flex-1 max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size="18" class="text-gray-400" />
        </div>
        <input type="text" bind:value={searchQuery} placeholder="Search..." class="input pl-10 pr-10 w-full" />
        {#if searchQuery}
            <button
                onclick={clearSearch}
                class="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600"
                title="Clear search"
            >
                <X size="16" />
            </button>
        {/if}
    </div>

    <!-- Search Results Info -->
    {#if searchQuery}
        <div class="text-sm text-gray-600">
            {#if sorted.length === 0}
                No results found for "{searchQuery}"
            {:else if sorted.length === 1}
                1 result found for "{searchQuery}"
            {:else}
                {sorted.length} results found for "{searchQuery}"
            {/if}
        </div>
    {/if}
</div>

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
                                <Controls
                                    onEdit={createRowCallback(onEdit, row.id)}
                                    onDelete={createRowCallback(onDelete, row.id)}
                                />
                            </td>
                        {/if}
                        {#each columns as column}
                            <td class="px-2 py-1 min-w-24 max-w-32 truncate">
                                {row[column]}
                            </td>
                        {/each}
                    </tr>
                {:else}
                    <tr>
                        <td colspan={columns.length + (showControls ? 1 : 0)} class="text-center py-8 text-gray-500">
                            {#if searchQuery}
                                No results found for "{searchQuery}"
                            {:else}
                                No data available
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="lg:hidden space-y-4">
        {#if searchQuery}
            <div class="text-sm text-gray-600 mb-2">
                {sorted.length} results for "{searchQuery}"
            </div>
        {/if}
        <div>Page too narrow to display table.</div>

        <!-- Mobile card view for search results -->
        {#if sorted.length > 0}
            <div class="space-y-2">
                {#each paginated as row (row[idColumn])}
                    <div class="card p-4 border" animate:flip={{ duration: 350 }}>
                        {#each columns.slice(0, 3) as column}
                            <div class="flex justify-between items-center">
                                <span class="font-medium text-sm">
                                    {titleCase((column as string).replace("_", " "))}:
                                </span>
                                <span class="text-sm truncate ml-2">{row[column]}</span>
                            </div>
                        {/each}
                        {#if showControls}
                            <div class="mt-2 pt-2 border-t">
                                <Controls
                                    onEdit={createRowCallback(onEdit, row.id)}
                                    onDelete={createRowCallback(onDelete, row.id)}
                                />
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>

<!-- Pagination Controls -->
<div class="pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
    <!-- Create Button -->
    <div class="flex-shrink-0">
        {#if onCreate}
            <button class="btn preset-filled-primary-500" onclick={onCreate}> Create </button>
        {/if}
    </div>

    <!-- Pagination Info and Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-center">
        <!-- Rows per page selector -->
        <div class="flex items-center gap-2 text-sm">
            <span>Rows:</span>
            <select bind:value={nRowsPerPage} class="select select-sm border" onchange={() => (currentPage = 0)}>
                {#each paginationOptions as option}
                    <option value={option}>{option}</option>
                {/each}
            </select>
        </div>

        <!-- Pagination info -->
        <div class="text-sm text-gray-600">
            {#if sorted.length === 0}
                No data
            {:else}
                {startIndex}-{endIndex} of {sorted.length}
                {#if searchQuery && sorted.length !== data.length}
                    (filtered from {data.length})
                {/if}
            {/if}
        </div>

        <!-- Pagination buttons -->
        {#if maxPages > 1}
            <div class="flex items-center gap-1">
                <!-- First page -->
                <button
                    class="btn btn-sm preset-ghost"
                    onclick={goToFirstPage}
                    disabled={currentPage === 0}
                    title="First page"
                >
                    <ChevronsLeft size="16" />
                </button>

                <!-- Previous page -->
                <button
                    class="btn btn-sm preset-ghost"
                    onclick={goToPreviousPage}
                    disabled={currentPage === 0}
                    title="Previous page"
                >
                    <ChevronLeft size="16" />
                </button>

                <!-- Page numbers -->
                <div class="flex items-center gap-1">
                    {#each getVisiblePages() as pageNum}
                        {#if pageNum === 0 && getVisiblePages()[0] > 1}
                            <button class="btn btn-sm preset-ghost" onclick={() => (currentPage = 0)}> 1 </button>
                            <span class="px-1">...</span>
                        {/if}

                        <button
                            class="btn btn-sm"
                            class:preset-filled-secondary-500={currentPage === pageNum}
                            class:preset-ghost={currentPage !== pageNum}
                            onclick={() => (currentPage = pageNum)}
                        >
                            {pageNum + 1}
                        </button>

                        {#if pageNum === getVisiblePages().slice(-1)[0] && getVisiblePages().slice(-1)[0] < maxPages - 2}
                            <span class="px-1">...</span>
                            <button class="btn btn-sm preset-ghost" onclick={() => (currentPage = maxPages - 1)}>
                                {maxPages}
                            </button>
                        {/if}
                    {/each}
                </div>

                <!-- Next page -->
                <button
                    class="btn btn-sm preset-ghost"
                    onclick={goToNextPage}
                    disabled={currentPage === maxPages - 1}
                    title="Next page"
                >
                    <ChevronRight size="16" />
                </button>

                <!-- Last page -->
                <button
                    class="btn btn-sm preset-ghost"
                    onclick={goToLastPage}
                    disabled={currentPage === maxPages - 1}
                    title="Last page"
                >
                    <ChevronsRight size="16" />
                </button>
            </div>
        {/if}
    </div>
</div>
