<script script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getToastStore, SlideToggle, Tab, TabGroup } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"
    import Checkout from "./Checkout/Checkout.svelte"
    import { DecisionTree } from "./DecisionTree"
    import TemplatesDirectory from "./TemplatesDirectory/TemplatesDirectory.svelte"
    import SelectedNodes from "./SelectedNodes.svelte"
    import MarkdownEditor from "$lib/components/MarkdownEditor.svelte"
    import { nodesToMarkdown } from "./TemplatesDirectory/templateExport"
    import { downloadBlob } from "$lib/utils"

    export let data

    let selectedNodes: DecisionTree[] = []
    let tabSet: number = 0
    let editable: boolean = false
    let nodes: undefined | DecisionTree = undefined
    let fetchFailed = false
    let isLoading = false
    const toastStore = getToastStore()

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

    function exportTemplates() {
        if (!nodes) {
            toastStore.trigger({ message: "Templates have not finished loading.", background: "variant-filled-error" })
            return
        }
        isLoading = true
        let markdown = nodesToMarkdown(nodes)

        fetch("/api/markdown2docx", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: markdown
        })
            .then(async res => {
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                return await res.blob()
            })
            .then(blob => {
                const filename = "templates.docx"
                downloadBlob(blob, filename)
                isLoading = false
            })
            .catch(error => {
                toastStore.trigger({ message: error.message, background: "variant-filled-error" })
                isLoading = false
            })
    }
</script>

{#if editable}
    <div class="hidden">
        <!-- Preload to reduce loading time on the Markdown modals.-->
        <MarkdownEditor />
    </div>
{/if}

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
                {#if data.user?.is_admin}
                    <div class="flex space-x-3 pb-2">
                        <div class="right-0 content-center">
                            <SlideToggle name="slider-editable" size="sm" bind:checked={editable}>Editable</SlideToggle>
                        </div>
                        {#if isLoading}
                            <LoadingBar label="Preparing template document." />
                        {:else}
                            <button
                                disabled={isLoading}
                                class="btn variant-filled-primary hover:variant-soft-primary"
                                on:click={exportTemplates}
                            >
                                Export Templates
                            </button>
                        {/if}
                    </div>
                {/if}
                <TemplatesDirectory {nodes} bind:selectedNodes {editable} />
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
