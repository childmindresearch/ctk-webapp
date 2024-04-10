<script script lang="ts">
    import { SlideToggle, Tab, TabGroup } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"
    import { DecisionTree } from "$lib/utils"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import Checkout from "./Checkout.svelte"
    import DiagnosesDirectory from "./DiagnosesDirectory.svelte"
    import SelectedNodes from "./SelectedNodes.svelte"
    import SearchDiagnoses from "./SearchDiagnoses.svelte"

    let selectedNodes: DecisionTree[] = []
    let filteredNodes: DecisionTree
    let tabSet: number = 0
    let editable: boolean = false
    let nodes: undefined | DecisionTree = undefined
    let fetchFailed = false

    onMount(async () => {
        const diagnoses = fetch("/api/diagnoses")
            .then(res => res.json())
            .catch(() => {
                fetchFailed = true
                return []
            })
        nodes = new DecisionTree(await diagnoses)
    })
</script>

{#if fetchFailed}
    <p>Failed to fetch data. If this error persists, please contact an administrator.</p>
{:else if !nodes}
    <LoadingBar />
{:else}
    <TabGroup>
        <Tab bind:group={tabSet} name="Diagnoses" value={0}>Diagnoses List</Tab>
        <Tab bind:group={tabSet} name="Selection" value={1}>{selectedNodes.length} Selections</Tab>
        <Tab bind:group={tabSet} name="Report" value={2}>Report Generation</Tab>

        <svelte:fragment slot="panel">
            <div hidden={tabSet !== 0}>
                <div class="right-0">
                    <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
                </div>
                <SearchDiagnoses tree={nodes} bind:filteredNodes />
                <DiagnosesDirectory bind:nodes={filteredNodes} bind:selectedNodes {editable} />
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
