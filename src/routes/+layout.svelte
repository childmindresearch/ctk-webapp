<script lang="ts">
    import { browser } from "$app/environment"
    import { page } from "$app/stores"
    import NavBar from "$lib/components/NavBar.svelte"
    import Navigation from "$lib/components/Navigation.svelte"
    import { toaster } from "$lib/utils"
    import { Toaster } from "@skeletonlabs/skeleton-svelte"
    import "../app.css"

    let { children } = $props()

    $effect(() => {
        $page.url.pathname
        try {
            warmupFunction()
        } catch {
            console.error("Could not contact backend.")
        }
    })

    async function warmupFunction() {
        if (!browser) return
        await fetch("/api/health")
    }
</script>

<Toaster {toaster}></Toaster>

<svelte:head>
    <title>Clinician Toolkit</title>
    <meta name="description" content="The Clinician Toolkit developed by Child Mind Institute" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/ico" href="/favicon.ico" />
</svelte:head>

<header>
    <NavBar />
</header>

<div class="flex h-screen">
    <!-- Left sidebar navigation for medium+ screens -->
    <div class="hidden md:block md:w-64 h-full z-10 flex-shrink-0">
        <Navigation isOpen={true} />
    </div>

    <div class="overflow-y-auto px-10 pt-5 flex-1">
        {@render children()}
    </div>
</div>
