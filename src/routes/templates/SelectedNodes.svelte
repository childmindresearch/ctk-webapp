<script lang="ts">
    import { flip } from "svelte/animate"
    import { quintOut } from "svelte/easing"
    import type { DecisionTree } from "./DecisionTree.svelte"
    import { ArrowUp, ArrowDown, Trash, ChevronRight } from "lucide-svelte"
    import { toast } from "svelte-sonner"
    import { Button } from "$lib/components/ui/button"
    import { Card } from "$lib/components/ui/card"
    import * as Table from "$lib/components/ui/table"
    import { Badge } from "$lib/components/ui/badge"

    export let nodes: DecisionTree[]

    function removeNode(node: DecisionTree): void {
        nodes = nodes.filter(n => n.id !== node.id)
        toast.success("Template removed from selection.")
    }

    function getNodePath(node: DecisionTree): string[] {
        return node.getPath().slice(1)
    }

    function move(node: DecisionTree, by: number): void {
        const index = nodes.findIndex(n => n.id == node.id)
        if (index === undefined) {
            return
        }
        const swapIndex = index + by
        if (swapIndex < 0 || swapIndex >= nodes.length) {
            return
        }
        ;[nodes[index], nodes[swapIndex]] = [nodes[swapIndex], nodes[index]]
    }
</script>

{#if nodes.length === 0}
    <Card class="p-8">
        <div class="flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Trash class="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 class="text-lg font-semibold mb-2">No Templates Selected</h3>
            <p class="text-muted-foreground">Add templates from the Templates List to see them here.</p>
        </div>
    </Card>
{:else}
    <Card>
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.Head class="w-[120px]">Actions</Table.Head>
                    <Table.Head>Template Path</Table.Head>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {#each nodes as node (node)}
                    <div animate:flip={{ delay: 0, duration: 250, easing: quintOut }} class="flex-row w-max">
                        <Table.Row class="group">
                            <Table.Cell>
                                <div class="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8"
                                        onclick={() => move(node, -1)}
                                        disabled={nodes.indexOf(node) === 0}
                                        aria-label="Move up"
                                    >
                                        <ArrowUp class="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8"
                                        onclick={() => move(node, 1)}
                                        disabled={nodes.indexOf(node) === nodes.length - 1}
                                        aria-label="Move down"
                                    >
                                        <ArrowDown class="h-4 w-4" />
                                    </Button>
                                    <div class="w-px h-6 bg-border mx-1"></div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onclick={() => removeNode(node)}
                                        aria-label="Remove template"
                                    >
                                        <Trash class="h-4 w-4" />
                                    </Button>
                                </div>
                            </Table.Cell>
                            <Table.Cell class="w-full">
                                <nav aria-label="Breadcrumb" class="flex items-center flex-wrap gap-1">
                                    {#each getNodePath(node) as path, index}
                                        {#if index !== 0}
                                            <ChevronRight
                                                class="h-4 w-4 text-muted-foreground shrink-0"
                                                aria-hidden="true"
                                            />
                                        {/if}
                                        <Badge
                                            variant={index === getNodePath(node).length - 1 ? "default" : "secondary"}
                                            class="font-normal"
                                        >
                                            {path}
                                        </Badge>
                                    {/each}
                                </nav>
                            </Table.Cell>
                        </Table.Row>
                    </div>
                {/each}
            </Table.Body>
        </Table.Root>
    </Card>
{/if}
