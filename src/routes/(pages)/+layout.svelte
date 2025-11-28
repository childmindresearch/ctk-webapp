<script lang="ts">
    import { GetHealth } from "$api/v1"
    import { browser } from "$app/environment"
    import { page } from "$app/stores"
    import Navigation from "$lib/components/Navigation/Navigation.svelte"
    import { Toaster } from "$lib/shadcn/components/ui/sonner"
    import { toast } from "svelte-sonner"
    import "../../app.css"

    console.log(`Running Clinician Toolkit version: ${import.meta.env.VITE_APP_VERSION}`)
    let { data, children } = $props()

    $effect(() => {
        // Expression triggers the effect.
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        $page.url.pathname
        try {
            warmupFunction()
        } catch {
            console.error("Could not contact backend.")
        }
    })

    if (!data.navbarPages) {
        toast.error("Could not load layout.")
    }
    let lastWarmupTime = 0

    async function warmupFunction() {
        if (!browser) return

        const now = Date.now()
        const threeMinutesInMs = 3 * 60 * 1000

        if (now - lastWarmupTime < threeMinutesInMs) return

        await GetHealth.fetch({})
        lastWarmupTime = now
    }
</script>

<Toaster />

<svelte:head>
    <title>Clinician Toolkit</title>
    <meta name="description" content="The Clinician Toolkit developed by Child Mind Institute" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/ico" href="/favicon.ico" />
</svelte:head>

<div class="flex h-screen">
    <!-- Left sidebar navigation for medium+ screens -->
    <div class="hidden md:block md:w-64 h-full z-10 flex-shrink-0">
        {#if data.navbarPages}
            <Navigation pages={data.navbarPages} isOpen={true} />
        {/if}
    </div>

    <div class="overflow-y-auto h-full px-10 pt-5 flex-1">
        {@render children()}
    </div>
</div>
