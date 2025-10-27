<script lang="ts">
    import Fuse from "fuse.js"
    import type { DecisionTree } from "../DecisionTree.svelte"

    type Props = {
        tree: DecisionTree
        filteredNodes?: DecisionTree[]
    }
    let { tree, filteredNodes = $bindable([tree]) }: Props = $props()

    const allChildNodes = tree.getChildrenRecursive()
    const pathsTextsAndIds = allChildNodes.map(node => ({
        path: node.getPath().join(" "),
        id: node.id
    }))
    const searcher = new Fuse(pathsTextsAndIds, {
        keys: ["path"],
        threshold: 0.3,
        isCaseSensitive: false,
        useExtendedSearch: true,
        ignoreLocation: true
    })

    let debounceTimer: ReturnType<typeof setTimeout>
    function debounceSearch(event: Event) {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => searchTemplates(event), 150)
    }

    function searchTemplates(event: Event) {
        const input = event.target as HTMLInputElement
        const query = input.value.trim()

        if (!query) {
            filteredNodes = [tree]
            return
        }

        const searchedPaths = searcher.search(query).map(result => result.item)
        const searchedNodes = allChildNodes.filter(node => searchedPaths.some(path => path.id === node.id))
        const searchIncludingParentKid = [
            ...searchedNodes.map(node => [...node.getAncestors(), node]).flat(),
            ...searchedNodes.map(node => node.getChildrenRecursive()).flat()
        ].filter((value, index, self) => self.indexOf(value) === index)
        filteredNodes = tree.filterChildrenByIds(searchIncludingParentKid.map(node => node.id))
    }
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] flex items-center">
    <i class="fas fa-search ml-2"></i>
    <input class="input" type="search" placeholder="Search..." oninput={debounceSearch} />
</div>
