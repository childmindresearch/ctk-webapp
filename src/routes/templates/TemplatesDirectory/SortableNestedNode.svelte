<script lang="ts">
    import { FilePlus2, FolderClosed, FolderOpen } from "lucide-svelte"
    import Sortable, { type SortableEvent } from "sortablejs"
    import { onMount } from "svelte"
    import SvelteMarkdown from "svelte-markdown"
    import { Button } from "$lib/components/ui/button"
    import { cn } from "$lib/utils"
    import type { DecisionTree } from "../DecisionTree.svelte"
    import CreateButton from "./CreateButton.svelte"
    import DeleteButton from "./DeleteButton.svelte"
    import EditButton from "./EditButton.svelte"
    import SortableNestedNode from "./SortableNestedNode.svelte"
    import { openNodeIds } from "./store"
    import sanitizeHtml from "sanitize-html"

    type Props = {
        node: DecisionTree
        editable: boolean
        onDrag: (event: Sortable.SortableEvent) => Promise<void>
        onAddToCart: (node: DecisionTree) => void
        _isRoot?: boolean
    }

    let { node, editable, onDrag, onAddToCart, _isRoot }: Props = $props()

    let sorter: Sortable | undefined = undefined
    let hasDragged = $state(false)

    function sanitize(html: string): string {
        return sanitizeHtml(html, {
            allowedTags: ["a", "span", "p", "h1", "h2", "h3", "table", "tbody", "td", "tfoot", "th", "thead", "tr"],

            allowedAttributes: {
                span: ["style"]
            }
        })
    }
    async function onDragChildren(event: Sortable.SortableEvent) {
        await onDrag(event)
        hasDragged = !hasDragged
    }

    function fold() {
        if (_isRoot) return
        if ($openNodeIds.has(node.id)) {
            openNodeIds.set(new Set([...$openNodeIds].filter(id => id !== node.id)))
        } else {
            openNodeIds.set(new Set([...$openNodeIds, node.id]))
        }
    }

    let isFolded = $state(_isRoot ? false : !$openNodeIds.has(node.id))

    const unsubscribe = openNodeIds.subscribe(value => {
        if (node === undefined) return
        isFolded = _isRoot ? false : !value.has(node.id)
    })

    onMount(() => {
        const rootElem = document.getElementById(`node-${node.id}`)
        if (!rootElem) return
        if (node.children.length === 0) return

        sorter = Sortable.create(rootElem, {
            group: {
                name: `node-${node.id}`,
                put: true,
                pull: true
            },
            disabled: true,
            animation: 100,
            onEnd: (event: SortableEvent) => {
                if (
                    [event.oldIndex, event.newIndex, event.to, event.from, event.item].every(
                        value => value !== undefined
                    )
                ) {
                    onDragChildren(event)
                }
            }
        })

        return unsubscribe
    })

    $effect(() => sorter?.option("disabled", !editable))
</script>

<div>
    <div class="flex items-center gap-1">
        <Button
            variant="ghost"
            size="icon"
            class="h-8 w-8 shrink-0"
            onclick={node.children.length === 0 ? () => onAddToCart(node) : fold}
            aria-label={node.children.length === 0 ? "Add to cart" : isFolded ? "Expand folder" : "Collapse folder"}
        >
            {#if node.children.length === 0}
                <FilePlus2 class="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            {:else if isFolded}
                <FolderClosed class="h-5 w-5 text-foreground hover:text-primary transition-colors" />
            {:else}
                <FolderOpen class="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
            {/if}
        </Button>

        <div class="flex-1 overflow-y-auto max-h-[200px] prose prose-sm dark:prose-invert">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html sanitize(node.text)}
        </div>

        {#if editable}
            <div class="flex items-center gap-1 shrink-0">
                <CreateButton {node} />
                {#if !_isRoot}
                    <EditButton {node} />
                    <DeleteButton {node} />
                {/if}
            </div>
        {/if}
    </div>

    <div id={`node-${node.id}`} class={cn("border-l-2 border-border pl-3 mb-2 transition-all", isFolded && "hidden")}>
        {#if !isFolded}
            {#key hasDragged}
                {#each node.children as child, index (child.id)}
                    <SortableNestedNode node={node.children[index]} {editable} onDrag={onDragChildren} {onAddToCart} />
                {/each}
            {/key}
        {/if}
    </div>
</div>
