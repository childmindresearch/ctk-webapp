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
    import { slide } from "svelte/transition"
    import ChevronRotating from "./ChevronRotating.svelte"

    let { pages: initialPages, isOpen = $bindable() }: Props = $props()

    let pages = $state(
        initialPages.map(page => ({
            ...page,
            isOpen: "subPages" in page ? false : undefined
        }))
    )

    let classesActive = $derived((href: string) =>
        href === page.url.pathname
            ? "bg-primary-100 text-primary-900 border-primary-200"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    )

    let classesSubActive = $derived((href: string) =>
        href === page.url.pathname
            ? "bg-primary-50 text-primary-800"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
    )
</script>

<nav
    class="flex flex-col h-full border-r border-surface-200 flex-1 px-4 py-6 overflow-y-auto"
    data-testid="div-navigation"
>
    <ul class="space-y-2">
        {#each pages as page}
            <li>
                {#if "subPages" in page}
                    <button
                        class="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 {page.isOpen
                            ? 'bg-primary-100 text-primary-900 border-primary-200'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}"
                        data-testid="button-navigation"
                        onclick={() => {
                            page.isOpen = !page.isOpen
                        }}
                    >
                        <span class="flex items-center">
                            {page.name}
                        </span>
                        {#if page.badge}
                            <span class="badge preset-filled-error-500 rounded-2xl">{page.badge}</span>
                        {/if}
                        <ChevronRotating pointUp={page.isOpen || false} />
                    </button>

                    {#if page.isOpen}
                        <ul transition:slide class="mt-2 ml-4 space-y-1">
                            {#each page.subPages as { name: subName, href: subHref }}
                                <li>
                                    <a
                                        href={subHref}
                                        class="block px-3 py-2 text-sm rounded-md transition-all duration-200 {classesSubActive(
                                            subHref
                                        )}"
                                        data-testid="a-sub-navigation"
                                        onclick={() => {
                                            isOpen = false
                                        }}
                                    >
                                        {subName}
                                    </a>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                {:else}
                    <a
                        href={page.href}
                        class="group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 {classesActive(
                            page.href as string
                        )}"
                        data-testid="a-navigation"
                        onclick={() => {
                            isOpen = false
                        }}
                    >
                        <span class="flex items-center">
                            {page.name}
                        </span>
                        {#if page.badge}
                            <span class="badge preset-filled-error-500 rounded-2xl">{page.badge}</span>
                        {/if}
                    </a>
                {/if}
            </li>
        {/each}
    </ul>
</nav>
