<script lang="ts">
    import { page } from "$app/state"

    type Props = {
        isOpen: boolean
    }

    let { isOpen = $bindable() }: Props = $props()

    const pages = [
        { name: "DSM Codes", href: "/dsm" },
        { name: "Intake", href: "/intake" },
        { name: "Pyrite Reports", href: "/pyrite", badge: "Alpha" },
        { name: "Summarization", href: "/summarization" },
        { name: "Templates", href: "/templates" }
    ]

    let classesActive = $derived((href: string) =>
        href === page.url.pathname
            ? "bg-primary-100 text-primary-900 border-primary-200"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
    )
</script>

<nav class="flex flex-col h-full border-r border-surface-200" data-testid="div-navigation">
    <div class="flex-1 px-4 py-6 overflow-y-auto">
        <ul class="space-y-2">
            {#each pages as { name, href, badge }}
                <li>
                    <a
                        {href}
                        class="group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 {classesActive(
                            href
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
                </li>
            {/each}
        </ul>
    </div>
</nav>
