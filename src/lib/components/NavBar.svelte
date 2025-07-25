<script lang="ts">
    import { Modal, AppBar } from "@skeletonlabs/skeleton-svelte"
    import Navigation from "./Navigation/Navigation.svelte"
    import { Menu, Mail } from "@lucide/svelte"
    import type { Props as NavigationProps } from "$lib/components/Navigation/Navigation.svelte"

    type Props = {
        pages: NavigationProps["pages"]
    }

    let { pages }: Props = $props()
    let drawerState = $state(false)
</script>

<AppBar background="bg-surface-50" border="border-b border-surface-200" trailBase="!space-x-2">
    {#snippet lead()}
        <div class="flex items-center md:hidden">
            <Modal
                open={drawerState}
                onOpenChange={e => (drawerState = e.open)}
                triggerBase="btn hover:preset-tonal"
                contentBase="bg-surface-50 p-4 space-y-4 shadow-xl w-[480px] h-screen"
                positionerJustify="justify-start"
                positionerAlign=""
                positionerPadding=""
                transitionsPositionerIn={{ x: -480, duration: 200 }}
                transitionsPositionerOut={{ x: -480, duration: 200 }}
            >
                {#snippet trigger()}
                    <Menu />
                {/snippet}
                {#snippet content()}
                    <Navigation {pages} bind:isOpen={drawerState} />
                {/snippet}
            </Modal>
        </div>
        <a href="/" data-testid="a-cmi-logo" class="hidden md:block">
            <img src="/cmi.svg" alt="Clinician Toolkit" class="w-28" />
        </a>
    {/snippet}
    {#snippet trail()}
        <button class="btn preset-filled-primary-500">
            <a
                href="https://chief-resonance-054.notion.site/138229e809388113b654dabf11c4dd33?pvs=105"
                target="_blank"
                rel="noreferrer"
            >
                <div class="flex space-x-2">
                    <Mail />
                    <div>Feedback</div>
                </div>
            </a>
        </button>
    {/snippet}
</AppBar>
