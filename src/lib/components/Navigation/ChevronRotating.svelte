<script lang="ts">
    type Props = {
        pointUp: boolean
    }

    let { pointUp = true }: Props = $props()
</script>

<svg
    class="w-4 h-4 transition-transform duration-200 {pointUp ? 'rotate-180' : ''}"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
>
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
</svg>
