<!--
Component for displaying a loading bar with a progress radial.

@component LoadingBar

@param {number | undefined} value - The value of the progress radial, if undefined
then it keeps spinning forever.
@param {string | undefined} label - The label to display below the progress radial.
-->
<script lang="ts">
    import { ProgressRing } from "@skeletonlabs/skeleton-svelte"

    type Props = {
        value?: number | null
        label?: string | undefined
        hidden?: boolean
    }
    let { value = null, label = undefined, hidden = false }: Props = $props()

    const meterStroke = "stroke-primary-500"
    const trackStroke = "stroke-primary-500/20"
    const strokeLinecap = "round"
</script>

<div class="mr-auto flex justify-center items-center" class:hidden>
    <ProgressRing {value} size="size-14" {meterStroke} {trackStroke} {strokeLinecap} />
</div>
{#if label}
    <p class="text-center text-md pt-2">{label}</p>
{/if}
