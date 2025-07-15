<script lang="ts">
    import { page } from "$app/state"
    import { slide } from "svelte/transition"

    type Props = {
        isOpen: boolean
    }

    let { isOpen = $bindable() }: Props = $props()

    const pages = [
        { name: "DSM Codes", href: "/dsm" },
        { name: "Intake", href: "/intake" },
        { name: "Pyrite Reports", href: "/pyrite", badge: "Alpha" },
        { name: "Summarization", href: "/summarization" },
        {
            name: "Referrals",
            subPages: [
                { name: "Download", href: "/referrals/download" },
                { name: "Providers", href: "/referrals/admin/providers" },
                { name: "Filter Sets", href: "/referrals/admin/filter-groups" },
                { name: "Selection Sets", href: "/referrals/admin/selection-sets" }
            ]
        },
        { name: "Templates", href: "/templates" }
    ]

    let referralsOpen = $state(false)

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

    let referralsActive = $derived(page.url.pathname.startsWith("/referrals"))
</script>

<nav class="flex flex-col h-full border-r border-surface-200" data-testid="div-navigation">
    <div class="flex-1 px-4 py-6 overflow-y-auto">
        <ul class="space-y-2">
            {#each pages as { name, href, badge, subPages }}
                <li>
                    {#if subPages}
                        <button
                            class="group flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 {referralsActive
                                ? 'bg-primary-100 text-primary-900 border-primary-200'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}"
                            data-testid="button-navigation"
                            onclick={() => {
                                referralsOpen = !referralsOpen
                            }}
                        >
                            <span class="flex items-center">
                                {name}
                            </span>
                            <svg
                                class="w-4 h-4 transition-transform duration-200 {referralsOpen ? 'rotate-180' : ''}"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {#if referralsOpen}
                            <ul transition:slide class="mt-2 ml-4 space-y-1">
                                {#each subPages as { name: subName, href: subHref }}
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
                            {href}
                            class="group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 {classesActive(
                                href as string
                            )}"
                            data-testid="a-navigation"
                            onclick={() => {
                                isOpen = false
                            }}
                        >
                            <span class="flex items-center">
                                {name}
                            </span>
                            {#if badge}
                                <span
                                    class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                                >
                                    {badge}
                                </span>
                            {/if}
                        </a>
                    {/if}
                </li>
            {/each}
        </ul>
    </div>
</nav>
