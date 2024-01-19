<script lang="ts">
  import { ProgressRadial } from "@skeletonlabs/skeleton"

  export let value: number | undefined = undefined
  export let color: "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "light" | "dark" = "primary"
  export let label: string | undefined = undefined

  const stroke = 100
  const width = "w-12"
  const meter = `stroke-${color}-500`
  const track = `stroke-${color}-500/30`
  const strokeLinecap = "round"
</script>

<div class="mr-auto flex justify-center items-center">
  <ProgressRadial {value} {meter} {track} {stroke} {width} {strokeLinecap} />
</div>
{#if label}
  <p class="text-center text-md pt-2">{label}</p>
{/if}
