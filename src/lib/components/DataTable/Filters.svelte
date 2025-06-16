<script lang="ts" generics="T extends Record<string, any>">
    type Props<T extends Record<string, any>> = {
        data: T[]
        columnsWithFilters?: (keyof T)[]
        onChange: (data: T[]) => void
    }

    let { data, columnsWithFilters = [], onChange }: Props<T> = $props()
    const originalData = data.slice()

    $effect(() => {
        columnFilters
        data = applyFilters(originalData)
        onChange(data)
    })

    const filterSeparator = ","
    let columnFilters: Record<string, string> = $state({})

    const columns = Object.keys(data[0]) as (keyof T)[]
    const columnUniqueValues = $derived(() => {
        const uniqueValues: Record<string, Set<string>> = {}

        columns.forEach(column => {
            uniqueValues[column as string] = new Set()
        })

        originalData.forEach(row => {
            columns.forEach(column => {
                const value = (String(row[column]) || "").trim()
                if (value) {
                    uniqueValues[column as string].add(value)
                }
            })
        })

        return Object.fromEntries(Object.entries(uniqueValues).map(([key, set]) => [key, Array.from(set).sort()]))
    })

    function titleCase(str: string) {
        return str
            .split(" ")
            .map(s => s.charAt(0).toUpperCase() + s.substring(1))
            .join(" ")
    }

    function applyFilters(data: T[]) {
        if (Object.keys(columnFilters).length > 0) {
            data = originalData.filter(row => {
                return Object.entries(columnFilters).every(([column, filterValue]) => {
                    if (!filterValue.trim()) return true

                    const cellValue = (String(row[column as keyof T]) || "").toLowerCase()
                    const filterValues = parseFilterValues(filterValue).map(v => v.toLowerCase())

                    return filterValues.some(filterVal => cellValue.includes(filterVal))
                })
            })
        }

        return data
    }

    function clearColumnFilter(column: string) {
        const { [column]: removed, ...rest } = columnFilters
        columnFilters = rest
    }

    function parseFilterValues(filterString: string): string[] {
        if (!filterString.trim()) return []
        return filterString
            .split(filterSeparator)
            .map(value => value.trim())
            .filter(value => value.length > 0)
    }

    function addFilterValue(column: string, value: string) {
        const currentFilter = columnFilters[column] || ""
        const currentValues = parseFilterValues(currentFilter)

        if (!currentValues.includes(value)) {
            const newValues = [...currentValues, value]
            columnFilters[column] = newValues.join(`${filterSeparator} `)
        }
    }

    function removeFilterValue(column: string, valueToRemove: string) {
        const currentFilter = columnFilters[column] || ""
        const currentValues = parseFilterValues(currentFilter)
        const newValues = currentValues.filter(v => v !== valueToRemove)

        if (newValues.length === 0) {
            clearColumnFilter(column)
        } else {
            columnFilters[column] = newValues.join(`${filterSeparator} `)
        }
    }

    function getActiveFilterValues(column: string): string[] {
        return parseFilterValues(columnFilters[column] || "")
    }
</script>

<div class="pb-2 space-y-2">
    {#if columnsWithFilters.length > 0}
        <div class="text-sm text-surface-600 mb-2">
            Tip: Use "{filterSeparator}" to separate multiple filter values (e.g., "Remote{filterSeparator} New York")
        </div>

        <div class="space-y-3">
            {#each columnsWithFilters as column}
                <div class="border rounded-lg p-3">
                    <div class="flex items-center gap-2 mb-2">
                        <label class="text-sm font-medium" for="filter-{String(column)}">
                            {titleCase((column as string).replace("_", " "))}:
                        </label>
                        <input
                            id="filter-{String(column)}"
                            class="input input-sm flex-1 max-w-md"
                            type="text"
                            bind:value={columnFilters[column as string]}
                            placeholder="Filter values separated by '{filterSeparator}'..."
                        />
                        {#if columnFilters[column as string]}
                            <button
                                class="btn btn-sm variant-ghost-surface"
                                onclick={() => clearColumnFilter(column as string)}
                                aria-label="Clear all filters for {String(column)}"
                            >
                                Clear
                            </button>
                        {/if}
                    </div>

                    <!-- Active filter tags -->
                    {#if getActiveFilterValues(column as string).length > 0}
                        <div class="flex flex-wrap gap-1 mb-2">
                            <span class="text-xs font-medium text-surface-700">Active filters:</span>
                            {#each getActiveFilterValues(column as string) as filterValue}
                                <span
                                    class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs"
                                >
                                    {filterValue}
                                    <button
                                        class="hover:bg-primary-200 rounded-full w-4 h-4 flex items-center justify-center"
                                        onclick={() => removeFilterValue(column as string, filterValue)}
                                        aria-label="Remove filter {filterValue}"
                                    >
                                        ×
                                    </button>
                                </span>
                            {/each}
                        </div>
                    {/if}

                    <!-- Quick filter suggestions -->
                    <div class="flex flex-wrap gap-1">
                        <span class="text-xs font-medium text-surface-600">Quick add:</span>
                        {#each columnUniqueValues()[column as string]?.slice(0, 8) || [] as value}
                            {#if !getActiveFilterValues(column as string).includes(value)}
                                <button
                                    class="px-2 py-1 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded text-xs transition-colors"
                                    onclick={() => addFilterValue(column as string, value)}
                                >
                                    {value}
                                </button>
                            {/if}
                        {/each}
                        {#if columnUniqueValues()[column as string]?.length > 8}
                            <span class="text-xs text-surface-500">
                                +{columnUniqueValues()[column as string].length - 8} more...
                            </span>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
