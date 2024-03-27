<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte"
  import Navigation from "$lib/components/Navigation.svelte"
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom"
  import {
    AppShell,
    Modal,
    Toast,
    initializeStores,
    storePopup,
    type ModalComponent,
    Drawer
  } from "@skeletonlabs/skeleton"
  import ModalMarkdown from "$lib/components/ModalMarkdown.svelte"
  import "../app.postcss"
  import "@cmi-dair/skeleton-themes/cmi.postcss"

  initializeStores()
  storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

  const modalRegistry: Record<string, ModalComponent> = {
    markdown: { ref: ModalMarkdown }
  }
</script>

<svelte:head>
  <title>Clinician Toolkit</title>
  <meta name="description" content="The Clinician Toolkit developed by Child Mind Institute" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>

<Modal zIndex="z-998" components={modalRegistry} />
<Toast zIndex="z-999" />

<Drawer width="w-64">
  <h2 class="p-4 h2">Navigation</h2>
  <hr />
  <Navigation />
</Drawer>

<AppShell slotSidebarLeft="bg-surface-500/5 w-0 md:w-64">
  <svelte:fragment slot="header">
    <NavBar />
  </svelte:fragment>
  <svelte:fragment slot="sidebarLeft">
    <Navigation />
  </svelte:fragment>
  <div class="overflow-y-hidden px-10 pt-5">
    <slot />
  </div>
</AppShell>
