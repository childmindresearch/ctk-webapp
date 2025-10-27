<script lang="ts">
  type Props = {
    options: string[]
    name: string
    value: string | undefined
    onChange: (selection: string[]) => void
  }

  const { options, name, onChange, value = "" }: Props = $props()
  let selected: string = $state(value)
  let activeFilters = $derived(
    selected
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== "")
  )

  $effect(() => onChange(activeFilters))

  function addFilterValue(value: string) {
    selected = [...activeFilters, value].join(", ")
  }

  function removeFilterValue(value: string) {
    selected = selected
      .split(",")
      .map(s => s.trim())
      .filter(s => s !== value)
      .join(", ")
  }
</script>

<div class="pb-2 space-y-2">
  <div class="border rounded-lg p-3">
    <div class="flex items-center gap-2 mb-2">
      <label class="text-sm font-medium" for="filter-{name}}">
        {name}
      </label>
      <input
        id="filter-{name}"
        autocomplete="off"
        class="input input-sm flex-1 max-w-md"
        type="text"
        bind:value={selected}
        placeholder="Filter values separated by a ','."
      />
    </div>

    <!-- Active filter tags -->
    {#if activeFilters.length > 0}
      <div class="flex flex-wrap gap-1 mb-2">
        <span class="text-xs font-medium text-surface-700">Active filters:</span>
        {#each activeFilters as filterValue}
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs">
            {filterValue}
            <button
              class="hover:bg-primary-200 rounded-full w-4 h-4 flex items-center justify-center"
              onclick={() => removeFilterValue(filterValue)}
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
      {#each options as value}
        {#if activeFilters.find(f => f === value) === undefined}
          <button
            class="px-2 py-1 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded text-xs transition-colors"
            onclick={() => addFilterValue(value)}
          >
            {value}
          </button>
        {/if}
      {/each}
    </div>
  </div>
</div>
