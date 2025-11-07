<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs"
    import { Badge } from "$lib/components/ui/badge"
    import Checkout from "./Checkout/Checkout.svelte"
    import { DecisionTree } from "./DecisionTree.svelte"
    import SelectedNodes from "./SelectedNodes.svelte"
    import TemplatesDirectory from "./TemplatesDirectory/TemplatesDirectory.svelte"
    import { toast } from "svelte-sonner"

    let { data } = $props()

    let selectedNodes: DecisionTree[] = $state([])
    let tabSet = $state("templates")

    let nodes = $state(new DecisionTree(data.templateRows))
    function onAddToCart(node: DecisionTree) {
        if (!node) return
        if (selectedNodes.find(savedNode => savedNode.id === node.id)) {
            toast.warning("This template is already selected.")
            return
        }
        selectedNodes = [...selectedNodes, node]
        toast.success("Template added to selection.")
    }
</script>

<Tabs.Root value={tabSet} onValueChange={value => (tabSet = value ?? "templates")}>
    <Tabs.List class="grid w-full grid-cols-3">
        <Tabs.Trigger value="templates">Templates List</Tabs.Trigger>
        <Tabs.Trigger value="selection" class="flex items-center gap-2">
            Selections
            {#if selectedNodes.length > 0}
                <Badge variant="secondary" class="ml-1">
                    {selectedNodes.length}
                </Badge>
            {/if}
        </Tabs.Trigger>
        <Tabs.Trigger value="report">Report Generation</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="templates" class="mt-6">
        <TemplatesDirectory {nodes} {onAddToCart} isAdmin={data.user?.is_admin || false} />
    </Tabs.Content>

    <Tabs.Content value="selection" class="mt-6">
        <SelectedNodes bind:nodes={selectedNodes} />
    </Tabs.Content>

    <Tabs.Content value="report" class="mt-6">
        {#key selectedNodes}
            <Checkout nodes={selectedNodes} />
        {/key}
    </Tabs.Content>
</Tabs.Root>
