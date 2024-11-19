<script lang="ts">
    import EnvelopeIcon from "$lib/icons/EnvelopeIcon.svelte"
    import GithubIcon from "$lib/icons/GithubIcon.svelte"
    import { AppBar, getDrawerStore } from "@skeletonlabs/skeleton"

    const drawerStore = getDrawerStore()

    function drawerOpen(): void {
        drawerStore.open({})
    }
</script>

<AppBar slotTrail="!space-x-2">
    <svelte:fragment slot="lead">
        <div class="flex items-center">
            <button class="md:hidden btn btn-sm mr-4" on:click={drawerOpen} aria-label="Drawer Menu">
                <span>
                    <svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
                        <rect width="100" height="20" />
                        <rect y="30" width="100" height="20" />
                        <rect y="60" width="100" height="20" />
                    </svg>
                </span>
            </button>
            <a href="/" data-testid="a-cmi-logo" class="hidden md:block">
                <img src="/cmi.svg" alt="Clinician Toolkit" class="w-28" />
            </a>
        </div>
    </svelte:fragment>
    <svelte:fragment slot="trail">
        <button class="btn hover:variant-soft-primary">
            <a
                href="https://chief-resonance-054.notion.site/138229e809388113b654dabf11c4dd33?pvs=105"
                target="_blank"
                rel="noreferrer"
            >
                <EnvelopeIcon class="text-lg" />
                <span>Feedback</span>
            </a>
        </button>
    </svelte:fragment>
</AppBar>
