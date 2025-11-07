<script lang="ts" module>
    type PageBranch = {
        name: string
        badge?: string
        subPages: PageLeaf[]
        isOpen?: boolean
    }
    type PageLeaf = {
        name: string
        href: string
        badge?: string
    }
    type Page = PageBranch | PageLeaf
    export type Props = {
        pages: Page[]
        isOpen: boolean
    }
</script>

<script lang="ts">
    import { page } from "$app/state"
    import { Button } from "$lib/components/ui/button"
    import { Badge } from "$lib/components/ui/badge"
    import * as Collapsible from "$lib/components/ui/collapsible"
    import ChevronRotating from "./ChevronRotating.svelte"

    let { pages: initialPages, isOpen = $bindable() }: Props = $props()

    let pages = $state(
        initialPages.map(page => ({
            ...page,
            isOpen: "subPages" in page ? false : undefined
        }))
    )

    let isPageActive = $derived((href: string) => href === page.url.pathname)
</script>

<nav class="flex flex-col h-full border-r flex-1 px-4 py-6 overflow-y-auto" data-testid="div-navigation">
    <img src="/cmi.svg" alt="CMI Logo" class="max-w-36 mx-auto pb-2" />
    <ul class="space-y-2">
        {#each pages as navPage (navPage)}
            <li>
                {#if "subPages" in navPage}
                    <Collapsible.Root bind:open={navPage.isOpen}>
                        <Collapsible.Trigger class="w-full">
                            <Button
                                variant="ghost"
                                class="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                                data-testid="button-navigation"
                            >
                                <span class="flex items-center">
                                    {navPage.name}
                                </span>
                                <div class="flex items-center gap-2">
                                    {#if navPage.badge}
                                        <Badge variant="destructive">{navPage.badge}</Badge>
                                    {/if}
                                    <ChevronRotating pointUp={navPage.isOpen || false} />
                                </div>
                            </Button>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                            <ul class="mt-2 ml-4 space-y-1">
                                {#each navPage.subPages as { name: subName, href: subHref } (subHref)}
                                    <li>
                                        <Button
                                            variant={isPageActive(subHref) ? "secondary" : "ghost"}
                                            class="w-full justify-start text-sm"
                                            href={subHref}
                                            data-testid="a-sub-navigation"
                                            onclick={() => {
                                                isOpen = false
                                            }}
                                        >
                                            {subName}
                                        </Button>
                                    </li>
                                {/each}
                            </ul>
                        </Collapsible.Content>
                    </Collapsible.Root>
                {:else}
                    <Button
                        variant={isPageActive(navPage.href) ? "secondary" : "ghost"}
                        class="w-full justify-between"
                        href={navPage.href}
                        data-testid="a-navigation"
                        onclick={() => {
                            isOpen = false
                        }}
                    >
                        <span class="flex items-center">
                            {navPage.name}
                        </span>
                        {#if navPage.badge}
                            <Badge variant="destructive">{navPage.badge}</Badge>
                        {/if}
                    </Button>
                {/if}
            </li>
        {/each}
    </ul>
</nav>
