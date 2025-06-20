<script lang="ts">
    import EnvelopeIcon from "$lib/icons/EnvelopeIcon.svelte"
    import { Modal, AppBar } from "@skeletonlabs/skeleton-svelte"
    import Navigation from "./Navigation.svelte"
    import BarsIcon from "$lib/icons/BarsIcon.svelte"

    let drawerState = $state(false)
</script>

<AppBar background="bg-surface-50" border="border-b border-surface-200" trailBase="!space-x-2">
    {#snippet lead()}
        <div class="flex items-center md:hidden">
            <Modal
                open={drawerState}
                onOpenChange={e => (drawerState = e.open)}
                triggerBase="btn hover:preset-tonal"
                contentBase="bg-surface-100-900 p-4 space-y-4 shadow-xl w-[480px] h-screen"
                positionerJustify="justify-start"
                positionerAlign=""
                positionerPadding=""
                transitionsPositionerIn={{ x: -480, duration: 200 }}
                transitionsPositionerOut={{ x: -480, duration: 200 }}
            >
                {#snippet trigger()}
                    <BarsIcon />
                {/snippet}
                {#snippet content()}
                    <Navigation bind:isOpen={drawerState} />
                {/snippet}
            </Modal>
        </div>
        <a href="/" data-testid="a-cmi-logo" class="hidden md:block">
            <img src="/cmi.svg" alt="Clinician Toolkit" class="w-28" />
        </a>
    {/snippet}
    {#snippet trail()}
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
    {/snippet}
</AppBar>
