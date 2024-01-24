<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte"
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom"
  import { AppShell, autoModeWatcher, Modal, Toast, initializeStores, storePopup } from "@skeletonlabs/skeleton"
  import "../app.postcss"
  import { onMount } from "svelte"

  initializeStores()

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

  onMount(() => {
    autoModeWatcher()
  })
</script>

<Modal />
<Toast />

<AppShell>
  <svelte:fragment slot="header">
    <NavBar />
  </svelte:fragment>
  <div class="overflow-y-hidden px-10 pt-5">
    <slot />
  </div>
</AppShell>
