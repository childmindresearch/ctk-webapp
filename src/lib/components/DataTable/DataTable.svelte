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
<script lang="ts" generics="T extends Record<string, unknown>">
    type Props<T extends Record<string, unknown>> = {
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
    } from "lucide-svelte"
    import { Button } from "$lib/components/ui/button"
    import { Input } from "$lib/components/ui/input"
    import * as Table from "$lib/components/ui/table"
    import * as Select from "$lib/components/ui/select"
    import * as Card from "$lib/components/ui/card"
    import Controls from "./Controls.svelte"

    let { data, idColumn, hiddenColumns, searchableColumns, onCreate, onEdit, onDelete }: Props<T> = $props()

    const paginationOptions = [5, 10, 20, 50] as const
    let currentPage = $derived(0)
    let nRowsPerPage: (typeof paginationOptions)[number] = $state(10)
    let sortKey: keyof T | null = $state(null)
    let sortDirection: -1 | 0 | 1 = $state(0)
    let searchQuery = $state("")
    let selectedRowsPerPage = $state("10")

    const showControls = onEdit || onDelete
    const columns = (Object.keys(data[0]) as (keyof T)[]).filter(name => !hiddenColumns?.includes(name))
    const columnsToSearch = searchableColumns || columns

    let filtered = $derived(applySearch(data, searchQuery))
    let sorted = $derived(applySort(filtered, sortKey, sortDirection))
    let paginated = $derived(applyPagination(sorted))
    let maxPages = $derived(Math.ceil(sorted.length / nRowsPerPage))
    let startIndex = $derived(currentPage * nRowsPerPage + 1)
    let endIndex = $derived(Math.min((currentPage + 1) * nRowsPerPage, sorted.length))

    $effect(() => {
        if (currentPage >= maxPages && maxPages > 0) {
            currentPage = Math.max(0, maxPages - 1)
        }
    })

    $effect(() => {
        nRowsPerPage = parseInt(selectedRowsPerPage) as (typeof paginationOptions)[number]
        currentPage = 0
    })

    function applySearch(data: { [K in keyof T]: unknown }[], query: string) {
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

    function applySort(data: { [K in keyof T]: unknown }[], key: keyof T | null, direction: -1 | 0 | 1) {
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

    function applyPagination(data: { [K in keyof T]: unknown }[]) {
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
        const delta = 2

        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i)
        }

        let start = Math.max(0, current - delta)
        let end = Math.min(totalPages - 1, current + delta)

        if (current <= delta) {
            end = Math.min(totalPages - 1, 4)
        }
        if (current >= totalPages - delta - 1) {
            start = Math.max(0, totalPages - 5)
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i)
    }

    const rowsPerPageOptions = paginationOptions.map(opt => ({
        value: String(opt),
        label: String(opt)
    }))

    let triggerContent = $derived(
        rowsPerPageOptions.find(opt => opt.value === selectedRowsPerPage)?.label ?? "Select rows"
    )
</script>

<!-- Search Bar -->
<div class="mb-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
    <div class="relative flex-1 max-w-md">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} class="text-muted-foreground" />
        </div>
        <Input type="text" bind:value={searchQuery} placeholder="Search..." class="pl-10 pr-10" />
        {#if searchQuery}
            <Button
                variant="ghost"
                size="icon"
                class="absolute inset-y-0 right-0 h-full w-10"
                onclick={clearSearch}
                title="Clear search"
            >
                <X size={16} />
            </Button>
        {/if}
    </div>

    <!-- Search Results Info -->
    {#if searchQuery}
        <div class="text-sm text-muted-foreground">
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

<!-- Desktop Table -->
<div class="rounded-md border overflow-hidden">
    <div class="hidden lg:block overflow-x-auto">
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    {#if showControls}
                        <Table.Head class="w-[100px]">Controls</Table.Head>
                    {/if}
                    {#each columns as name (name)}
                        <Table.Head class="whitespace-nowrap">
                            <Button
                                variant="ghost"
                                size="sm"
                                class="h-8 px-2 -ml-2"
                                onclick={() => {
                                    sortKey = name
                                    sortDirection -= 1
                                    if (sortDirection === -2) sortDirection = 1
                                }}
                            >
                                {titleCase((name as string).replace("_", " "))}
                                {#if sortKey !== name || sortDirection === 0}
                                    <ArrowDownUp size={13} class="ml-2" />
                                {:else if sortDirection === -1}
                                    <ArrowDown size={13} class="ml-2" />
                                {:else}
                                    <ArrowUp size={13} class="ml-2" />
                                {/if}
                            </Button>
                        </Table.Head>
                    {/each}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each paginated as row (row[idColumn])}
                    <Table.Row class="hover:bg-muted/50">
                        {#if showControls}
                            <Table.Cell>
                                <Controls
                                    onEdit={createRowCallback(onEdit, String(row.id))}
                                    onDelete={createRowCallback(onDelete, String(row.id))}
                                />
                            </Table.Cell>
                        {/if}
                        {#each columns as column (column)}
                            <Table.Cell class="min-w-24 max-w-32 truncate">
                                {row[column]}
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell
                            colspan={columns.length + (showControls ? 1 : 0)}
                            class="text-center py-8 text-muted-foreground"
                        >
                            {#if searchQuery}
                                No results found for "{searchQuery}"
                            {:else}
                                No data available
                            {/if}
                        </Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>

    <!-- Mobile View -->
    <div class="lg:hidden p-4">
        {#if searchQuery}
            <div class="text-sm text-muted-foreground mb-2">
                {sorted.length} results for "{searchQuery}"
            </div>
        {/if}

        <div class="text-sm text-muted-foreground mb-4">Page too narrow to display table.</div>

        <!-- Mobile card view for search results -->
        {#if sorted.length > 0}
            <div class="space-y-2">
                {#each paginated as row (row[idColumn])}
                    <Card.Root>
                        <Card.Content class="p-4">
                            {#each columns.slice(0, 3) as column (column)}
                                <div class="flex justify-between items-center py-1">
                                    <span class="font-medium text-sm">
                                        {titleCase((column as string).replace("_", " "))}:
                                    </span>
                                    <span class="text-sm truncate ml-2">{row[column]}</span>
                                </div>
                            {/each}
                            {#if showControls}
                                <div class="mt-3 pt-3 border-t">
                                    <Controls
                                        onEdit={createRowCallback(onEdit, String(row.id))}
                                        onDelete={createRowCallback(onDelete, String(row.id))}
                                    />
                                </div>
                            {/if}
                        </Card.Content>
                    </Card.Root>
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
            <Button onclick={onCreate}>Create</Button>
        {/if}
    </div>

    <!-- Pagination Info and Controls -->
    <div class="flex flex-col sm:flex-row gap-4 items-center">
        <!-- Rows per page selector -->
        <div class="flex items-center gap-2 text-sm">
            <span>Rows:</span>
            <Select.Root type="single" bind:value={selectedRowsPerPage}>
                <Select.Trigger class="w-[70px] h-9">
                    {triggerContent}
                </Select.Trigger>
                <Select.Content>
                    <Select.Group>
                        {#each rowsPerPageOptions as option (option.value)}
                            <Select.Item value={option.value} label={option.label}>
                                {option.label}
                            </Select.Item>
                        {/each}
                    </Select.Group>
                </Select.Content>
            </Select.Root>
        </div>

        <!-- Pagination info -->
        <div class="text-sm text-muted-foreground">
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
                <Button
                    variant="outline"
                    size="icon"
                    class="h-9 w-9"
                    onclick={goToFirstPage}
                    disabled={currentPage === 0}
                    title="First page"
                >
                    <ChevronsLeft size={16} />
                </Button>

                <!-- Previous page -->
                <Button
                    variant="outline"
                    size="icon"
                    class="h-9 w-9"
                    onclick={goToPreviousPage}
                    disabled={currentPage === 0}
                    title="Previous page"
                >
                    <ChevronLeft size={16} />
                </Button>

                <!-- Page numbers -->
                <div class="flex items-center gap-1">
                    {#each getVisiblePages() as pageNum (pageNum)}
                        {#if pageNum === 0 && getVisiblePages()[0] > 1}
                            <Button variant="outline" size="sm" class="h-9 w-9" onclick={() => (currentPage = 0)}
                                >1</Button
                            >
                            <span class="px-1 text-muted-foreground">...</span>
                        {/if}

                        <Button
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            class="h-9 w-9"
                            onclick={() => (currentPage = pageNum)}
                        >
                            {pageNum + 1}
                        </Button>

                        {#if pageNum === getVisiblePages().slice(-1)[0] && getVisiblePages().slice(-1)[0] < maxPages - 2}
                            <span class="px-1 text-muted-foreground">...</span>
                            <Button
                                variant="outline"
                                size="sm"
                                class="h-9 w-9"
                                onclick={() => (currentPage = maxPages - 1)}
                            >
                                {maxPages}
                            </Button>
                        {/if}
                    {/each}
                </div>

                <!-- Next page -->
                <Button
                    variant="outline"
                    size="icon"
                    class="h-9 w-9"
                    onclick={goToNextPage}
                    disabled={currentPage === maxPages - 1}
                    title="Next page"
                >
                    <ChevronRight size={16} />
                </Button>

                <!-- Last page -->
                <Button
                    variant="outline"
                    size="icon"
                    class="h-9 w-9"
                    onclick={goToLastPage}
                    disabled={currentPage === maxPages - 1}
                    title="Last page"
                >
                    <ChevronsRight size={16} />
                </Button>
            </div>
        {/if}
    </div>
</div>
