<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { Tabs } from "@skeletonlabs/skeleton-svelte"
    import { toaster } from "$lib/utils"
    import { onMount } from "svelte"
    import Checkout from "./Checkout/Checkout.svelte"
    import { DecisionTree } from "./DecisionTree.svelte"
    import TemplatesDirectory from "./TemplatesDirectory/TemplatesDirectory.svelte"
    import SelectedNodes from "./SelectedNodes.svelte"
    import MarkdownEditor from "$lib/components/MarkdownEditor.svelte"
    import type { LayoutProps } from "../$types"

    let { data }: LayoutProps = $props()

    let selectedNodes: DecisionTree[] = $state([])
    let tabSet = $state("templates")
    let nodes: undefined | DecisionTree = $state(undefined)
    let fetchFailed = $state(false)

    function onAddToCart(node: DecisionTree) {
        if (!node) return
        if (selectedNodes.find(savedNode => savedNode.id === node.id)) {
            toaster.warning({
                title: "This template is already selected."
            })
            return
        }

        selectedNodes = [...selectedNodes, node]
        toaster.success({
            title: "Template added to selection."
        })
    }

    onMount(async () => {
        const templates = fetch("/api/templates")
            .then(res => res.json())
            .catch(() => {
                fetchFailed = true
                return []
            })
        nodes = new DecisionTree(await templates)
        nodes.recursiveSortChildren()
    })
</script>

{#if data.user?.is_admin || false}
    <div class="hidden">
        <!-- Preload to reduce loading time on the Markdown modals.-->
        <MarkdownEditor />
    </div>
{/if}

{#if fetchFailed}
    <p>Failed to fetch data. If this error persists, please contact an administrator.</p>
{:else if nodes === undefined}
    <LoadingBar />
{:else}
    <Tabs value={tabSet} onValueChange={e => (tabSet = e.value)}>
        {#snippet list()}
            <Tabs.Control value="templates">Templates List</Tabs.Control>
            <Tabs.Control value="selection">{selectedNodes.length} Selections</Tabs.Control>
            <Tabs.Control value="report">Report Generation</Tabs.Control>
        {/snippet}
        {#snippet content()}
            <Tabs.Panel value="templates">
                <TemplatesDirectory
                    nodes={nodes as DecisionTree}
                    {onAddToCart}
                    isAdmin={data.user?.is_admin || false}
                />
            </Tabs.Panel>
            <Tabs.Panel value="selection">
                <SelectedNodes bind:nodes={selectedNodes} />
            </Tabs.Panel>
            <Tabs.Panel value="report">
                {#key selectedNodes}
                    <Checkout nodes={selectedNodes} />
                {/key}
            </Tabs.Panel>
        {/snippet}
    </Tabs>
{/if}
