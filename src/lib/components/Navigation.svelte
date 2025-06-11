<script lang="ts">
    import { page } from "$app/stores"
    import { getDrawerStore } from "@skeletonlabs/skeleton"

    const drawerStore = getDrawerStore()
    const pages = [
        { name: "DSM Codes", href: "/dsm" },
        { name: "Intake", href: "/intake" },
        { name: "Pyrite Reports (Alpha)", href: "/pyrite" },
        { name: "Summarization", href: "/summarization" },
        { name: "Referrals", href: "/referrals" },
        { name: "Templates", href: "/templates" }
    ]

    function drawerClose(): void {
        drawerStore.close()
    }

    let classesActive = $derived((href: string) =>
        href === $page.url.pathname ? "bg-primary-100 dark:bg-primary-700" : ""
    )
</script>

<nav class="list-nav p-4 flex flex-col" data-testid="div-navigation">
    <ul class="list-none" style="flex-grow: 1">
        {#each pages as { name, href }}
            <li>
                <a {href} class={classesActive(href)} data-testid="a-navigation" onclick={drawerClose}>{name}</a>
            </li>
        {/each}
    </ul>
</nav>
