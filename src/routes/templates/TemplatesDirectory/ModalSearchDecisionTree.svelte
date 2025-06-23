<script lang="ts">
    import Fuse from "fuse.js"
    import type { DecisionTree } from "../DecisionTree.svelte"

    type Props = {
        root: DecisionTree
        onSearchClick: (node: DecisionTree) => void
        onSaveClick: (node: DecisionTree) => void
    }
    const { root, onSearchClick, onSaveClick }: Props = $props()

    let searchTerm = $state("")
    let debounceSearchTerm = $state("")
    let elemDocSearch: HTMLElement
    let results: DecisionTree[] = $state([])

    const allChildNodes = root.getChildrenRecursive()
    const pathsTextsAndIds = allChildNodes.map(node => ({
        path: node.getPath().join(" "),
        id: node.id
    }))
    const searcher = new Fuse(pathsTextsAndIds, {
        keys: ["path"],
        threshold: 0,
        isCaseSensitive: false,
        useExtendedSearch: true,
        ignoreLocation: true
    })

    let debounceTimer: ReturnType<typeof setTimeout>
    function debounceSearch(event: Event) {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            searchTemplates()
            debounceSearchTerm = searchTerm
        }, 150)
    }

    function searchTemplates() {
        if (!searchTerm) {
            results = []
            return
        }

        const searchedPaths = searcher.search(searchTerm).map(result => result.item)
        const searchedNodes = allChildNodes.filter(node => searchedPaths.some(path => path.id === node.id))

        const searchedIds = [
            ...searchedNodes.map(node => [...node.getAncestors(), node]).flat(),
            ...searchedNodes.map(node => node.getChildrenRecursive()).flat()
        ]
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter(node => node.children.length === 0)
            .map(node => node.id)
        results = root.filterChildrenByIds(searchedIds)
    }

    function onKeyDown(event: KeyboardEvent) {
        if (["Enter", "ArrowDown"].includes(event.code)) {
            const queryFirstAnchorElement = elemDocSearch.querySelector("a")
            if (queryFirstAnchorElement) queryFirstAnchorElement.focus()
        }
    }
</script>

<div bind:this={elemDocSearch} class="card shadow-xl h-[36rem] flex flex-col">
    <!-- Header Section -->
    <header class="p-4 border-b border-surface-300 dark:border-surface-600 flex-shrink-0">
        <div class="input-group input-group-divider grid-cols-[auto_1fr_auto] flex items-center">
            <div class="flex items-center justify-center w-10">
                <i class="fa-solid fa-magnifying-glass text-surface-500" aria-hidden="true"></i>
            </div>
            <input
                class="input border-0 focus:ring-0 bg-transparent"
                bind:value={searchTerm}
                type="search"
                placeholder="Search templates..."
                oninput={debounceSearch}
                onkeydown={onKeyDown}
                autocomplete="off"
                role="searchbox"
                aria-label="Search templates"
            />
            {#if searchTerm}
                <button
                    class="btn-icon btn-icon-sm hover:bg-surface-200 dark:hover:bg-surface-700 rounded-full"
                    onclick={() => {
                        searchTerm = ""
                    }}
                    aria-label="Clear search"
                >
                    <i class="fa-solid fa-times text-sm" aria-hidden="true"></i>
                </button>
            {/if}
        </div>
    </header>

    <!-- Content Section -->
    <div class="flex-1 flex flex-col min-h-0">
        {#if results.length > 0}
            <!-- Results Header -->
            <div
                class="px-4 py-2 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 flex-shrink-0"
            >
                <p class="text-sm text-surface-600 dark:text-surface-400">
                    {results.length} result{results.length === 1 ? "" : "s"} found
                </p>
            </div>

            <!-- Results List -->
            <div class="flex-1 overflow-y-auto">
                <nav aria-label="Search results">
                    <ul class="divide-y divide-surface-200 dark:divide-surface-700" role="listbox">
                        {#each results as node, index}
                            <li class="group hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                                <div class="flex items-center p-3 gap-3">
                                    <!-- Add Button -->
                                    <button
                                        class="btn-icon btn-icon-sm variant-soft-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        onclick={() => onSaveClick(node)}
                                        aria-label="Add {node.getPath().slice(-1)[0]} to cart"
                                        title="Add to cart"
                                    >
                                        <i class="fa-solid fa-plus text-sm" aria-hidden="true"></i>
                                    </button>

                                    <!-- Template Path Button -->
                                    <button
                                        onclick={() => onSearchClick(node)}
                                        class="flex-1 text-left p-2 rounded hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                                        aria-label="Select template: {node.getPath().slice(1).join(' | ')}"
                                    >
                                        <div class="space-y-1">
                                            <!-- Template Name -->
                                            <div class="font-medium text-surface-900 dark:text-surface-100">
                                                {node.getPath().slice(-1)[0]}
                                            </div>

                                            <!-- Template Path -->
                                            {#if node.getPath().length > 1}
                                                <div
                                                    class="text-sm text-surface-600 dark:text-surface-400 flex items-center gap-1"
                                                >
                                                    {#each node.getPath().slice(0, -1) as pathPart, i}
                                                        {#if i > 0}
                                                            <i
                                                                class="fa-solid fa-chevron-right text-xs"
                                                                aria-hidden="true"
                                                            ></i>
                                                        {/if}
                                                        <span>{pathPart}</span>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    </button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </div>
        {:else if !debounceSearchTerm}
            <!-- Empty State -->
            <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div
                    class="w-16 h-16 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center mb-4"
                >
                    <i class="fa-solid fa-search text-2xl text-surface-500" aria-hidden="true"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">Search Templates</h3>
                <p class="text-surface-600 dark:text-surface-400 max-w-sm">
                    Start typing to search through available templates and find what you need.
                </p>
            </div>
        {:else}
            <!-- No Results State -->
            <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div
                    class="w-16 h-16 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center mb-4"
                >
                    <i class="fa-solid fa-exclamation-triangle text-2xl text-amber-500" aria-hidden="true"></i>
                </div>
                <h3 class="text-lg font-semibold mb-2">No Results Found</h3>
                <p class="text-surface-600 dark:text-surface-400 mb-4">
                    No templates found matching
                    <code class="code px-2 py-1 rounded bg-surface-200 dark:bg-surface-700">{debounceSearchTerm}</code>
                </p>
                <button
                    class="btn variant-ghost-surface btn-sm"
                    onclick={() => {
                        searchTerm = ""
                    }}
                >
                    Clear Search
                </button>
            </div>
        {/if}
    </div>

    <!-- Optional Footer -->
    <footer
        class="p-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 flex-shrink-0"
    >
        <div class="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>ESC to close</span>
        </div>
    </footer>
</div>
