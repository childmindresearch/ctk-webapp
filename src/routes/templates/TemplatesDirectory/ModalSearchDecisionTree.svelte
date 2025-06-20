<script lang="ts">
    import type { DecisionTree } from "../DecisionTree.svelte"
    import Fuse from "fuse.js"

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

<div bind:this={elemDocSearch} class="card p-4 shadow-xl space-y-4 h-[36rem]">
    <header class="input-group input-group-divider grid-cols-[auto_1fr_auto] flex items-center">
        <i class="fa-solid fa-magnifying-glass text-xl ml-4"></i>
        <input
            class="input"
            bind:value={searchTerm}
            type="search"
            placeholder="Search..."
            oninput={debounceSearch}
            onkeydown={onKeyDown}
        />
    </header>

    {#if results.length > 0}
        <nav class="list-nav" tabindex="-1">
            <ul class="overflow-y-auto h-[32rem]">
                {#each results as node}
                    <li class="text-lg">
                        <div class="flex items-center">
                            <button
                                class="btn w-[1rem] h-[1.5rem] hover:bg-surface-700"
                                onclick={() => onSaveClick(node)}
                                aria-label="Add to cart."
                            >
                                <i class="fa-solid fa-plus"></i>
                            </button>
                            <button onclick={() => onSearchClick(node)} class="btn hover:bg-surface-700">
                                <span class="text-wrap text-left">{node.getPath().slice(1).join("  |  ")}</span>
                            </button>
                        </div>
                    </li>
                {/each}
            </ul>
        </nav>
    {:else if !debounceSearchTerm}
        <div class="p-4">
            <p>Start typing to search for templates.</p>
        </div>
    {:else}
        <div class="p-4">
            <p>No Results found for <code class="code">{debounceSearchTerm}</code>.</p>
        </div>
    {/if}
</div>
