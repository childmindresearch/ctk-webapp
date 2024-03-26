<script lang="ts">
  import { dev } from "$app/environment"
</script>

{#if dev}
  <p>This page is under development.</p>
{:else}
  <slot />
{/if}
