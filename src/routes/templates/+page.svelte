<script script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { SlideToggle, Tab, TabGroup } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"
    import Checkout from "./Checkout.svelte"
    import { DecisionTree } from "./DecisionTree"
    import TemplatesDirectory from "./TemplatesDirectory.svelte"
    import SearchTemplates from "./SearchTemplates.svelte"
    import SelectedNodes from "./SelectedNodes.svelte"

    let selectedNodes: DecisionTree[] = []
    let filteredNodes: DecisionTree
    let tabSet: number = 0
    let editable: boolean = false
    let nodes: undefined | DecisionTree = undefined
    let fetchFailed = false

    onMount(async () => {
        const templates = fetch("/api/templates")
            .then(res => res.json())
            .catch(() => {
                fetchFailed = true
                return []
            })
        nodes = new DecisionTree(await templates)
    })
</script>

{#if fetchFailed}
    <p>Failed to fetch data. If this error persists, please contact an administrator.</p>
{:else if !nodes}
    <LoadingBar />
{:else}
    <TabGroup>
        <Tab bind:group={tabSet} name="Templates" value={0}>Templates List</Tab>
        <Tab bind:group={tabSet} name="Selection" value={1}>{selectedNodes.length} Selections</Tab>
        <Tab bind:group={tabSet} name="Report" value={2}>Report Generation</Tab>

        <svelte:fragment slot="panel">
            <div hidden={tabSet !== 0}>
                <div class="right-0">
                    <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
                </div>
                <SearchTemplates tree={nodes} bind:filteredNodes />
                <TemplatesDirectory bind:nodes={filteredNodes} bind:selectedNodes {editable} />
            </div>
            <div hidden={tabSet !== 1}>
                <SelectedNodes bind:nodes={selectedNodes} />
            </div>
            <div hidden={tabSet !== 2}>
                {#key selectedNodes}
                    <Checkout nodes={selectedNodes} />
                {/key}
            </div>
        </svelte:fragment>
    </TabGroup>
{/if}
