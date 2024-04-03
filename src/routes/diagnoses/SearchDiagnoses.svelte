<script lang="ts">
  import type { DecisionTree } from "$lib/utils"
  import Fuse from "fuse.js"

  export let tree: DecisionTree
  export let filteredNodes: DecisionTree = tree

  const allChildNodes = tree.getChildrenRecursive()
  const pathsTextsAndIds = allChildNodes.map(node => ({ path: node.getPath().join(" "), id: node.id, text: node.text }))
  const searcher = new Fuse(pathsTextsAndIds, {
    keys: ["path", "text"],
    threshold: 0.6
  })

  function searchDiagnoses(event: Event) {
    const input = event.target as HTMLInputElement
    const query = input.value.toLowerCase()

    if (!query) {
      filteredNodes = tree
      return
    }

    const searchedPaths = searcher.search(query.split(" ").join(" & ")).map(result => result.item)
    const searchedNodes = allChildNodes.filter(node => searchedPaths.some(path => path.id === node.id))
    const searchIncludingParentKid = [
      ...searchedNodes.map(node => [...node.getParents(), node]).flat(),
      ...searchedNodes.map(node => node.getChildrenRecursive()).flat()
    ].filter((value, index, self) => self.indexOf(value) === index)
    filteredNodes = tree.filterChildrenByIds(searchIncludingParentKid.map(node => node.id))
  }
</script>

<div class="input-group input-group-divider grid-cols-[auto_1fr_auto] flex items-center">
  <i class="fas fa-search ml-2"></i>
  <input class="input" type="search" placeholder="Search..." on:input={searchDiagnoses} />
</div>
