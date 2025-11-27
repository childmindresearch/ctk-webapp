<script lang="ts">
    import Fuse from "fuse.js"
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Input } from "$lib/shadcn/components/ui/input"
    import { Card, CardContent, CardFooter, CardHeader } from "$lib/shadcn/components/ui/card"
    import { Search, X, Plus, ChevronRight, AlertTriangle } from "lucide-svelte"
    import type { DecisionTree } from "../DecisionTree.svelte"

    type Props = {
        root: DecisionTree
        onSearchClick: (node: DecisionTree) => void
        onSaveClick: (node: DecisionTree) => void
    }

    const { root, onSearchClick, onSaveClick }: Props = $props()

    let searchTerm = $state("")
    let debounceSearchTerm = $state("")
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

    function debounceSearch() {
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
</script>

<Card class="h-[36rem] flex flex-col shadow-xl">
    <!-- Header Section -->
    <CardHeader class="flex-shrink-0 pb-3">
        <div class="relative flex items-center">
            <Search class="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
                class="pl-9 pr-9"
                bind:value={searchTerm}
                type="search"
                placeholder="Search templates..."
                oninput={debounceSearch}
                autocomplete="off"
                role="searchbox"
                aria-label="Search templates"
            />
            {#if searchTerm}
                <Button
                    variant="ghost"
                    size="icon"
                    class="absolute right-1 h-7 w-7"
                    onclick={() => {
                        searchTerm = ""
                    }}
                    aria-label="Clear search"
                >
                    <X class="h-4 w-4" />
                </Button>
            {/if}
        </div>
    </CardHeader>

    <!-- Content Section -->
    <CardContent class="flex-1 flex flex-col min-h-0 p-0">
        {#if results.length > 0}
            <!-- Results Header -->
            <div class="px-4 py-2 bg-muted border-b flex-shrink-0">
                <p class="text-sm text-muted-foreground">
                    {results.length} result{results.length === 1 ? "" : "s"} found
                </p>
            </div>

            <!-- Results List -->
            <div class="flex-1 overflow-y-auto">
                <nav aria-label="Search results">
                    <ul class="divide-y" role="listbox">
                        {#each results as node (node.id)}
                            <li class="group hover:bg-accent transition-colors">
                                <div class="flex items-center p-3 gap-3">
                                    <!-- Add Button -->
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        class="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                        onclick={() => onSaveClick(node)}
                                        aria-label="Add {node.getPath().slice(-1)[0]} to cart"
                                        title="Add to cart"
                                    >
                                        <Plus class="h-4 w-4" />
                                    </Button>

                                    <!-- Template Path Button -->
                                    <Button
                                        variant="ghost"
                                        class="flex-1 justify-start h-auto p-2"
                                        onclick={() => onSearchClick(node)}
                                        aria-label="Select template: {node.getPath().slice(1).join(' | ')}"
                                    >
                                        <div class="space-y-1 text-left">
                                            <!-- Template Name -->
                                            <div class="font-medium">
                                                {node.getPath().slice(-1)[0]}
                                            </div>

                                            <!-- Template Path -->
                                            {#if node.getPath().length > 1}
                                                <div class="text-sm text-muted-foreground flex items-center gap-1">
                                                    {#each node.getPath().slice(0, -1) as pathPart, i (pathPart)}
                                                        {#if i > 0}
                                                            <ChevronRight class="h-3 w-3" />
                                                        {/if}
                                                        <span>{pathPart}</span>
                                                    {/each}
                                                </div>
                                            {/if}
                                        </div>
                                    </Button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </nav>
            </div>
        {:else if !debounceSearchTerm}
            <!-- Empty State -->
            <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search class="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-semibold mb-2">Search Templates</h3>
                <p class="text-muted-foreground max-w-sm">
                    Start typing to search through available templates and find what you need.
                </p>
            </div>
        {:else}
            <!-- No Results State -->
            <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <AlertTriangle class="h-8 w-8 text-amber-500" />
                </div>
                <h3 class="text-lg font-semibold mb-2">No Results Found</h3>
                <p class="text-muted-foreground mb-4">
                    No templates found matching
                    <code class="relative rounded bg-muted px-2 py-1 font-mono text-sm">{debounceSearchTerm}</code>
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => {
                        searchTerm = ""
                    }}
                >
                    Clear Search
                </Button>
            </div>
        {/if}
    </CardContent>

    <!-- Footer -->
    <CardFooter class="flex-shrink-0 bg-muted/50 border-t py-2">
        <div class="flex items-center justify-between text-xs text-muted-foreground w-full">
            <span>Use ↑↓ to navigate, Enter to select</span>
            <span>ESC to close</span>
        </div>
    </CardFooter>
</Card>
