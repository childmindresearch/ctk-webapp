<script lang="ts">
  import "../app.postcss"
  import { AppShell, Toast, Modal } from "@skeletonlabs/skeleton"

  import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom"
  import { storePopup } from "@skeletonlabs/skeleton"
  import { initializeStores } from "@skeletonlabs/skeleton"
  import NavBar from "$lib/components/Navbar.svelte"

  initializeStores()

  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })
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
