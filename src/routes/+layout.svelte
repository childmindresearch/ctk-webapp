<script lang="ts">
  import NavBar from "$lib/components/NavBar.svelte"
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom"
  import { AppShell, Modal, Toast, initializeStores, storePopup, type ModalComponent } from "@skeletonlabs/skeleton"
  import "../app.postcss"
  import ModalMarkdown from "$lib/components/ModalMarkdown.svelte"

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

<AppShell>
  <svelte:fragment slot="header">
    <NavBar />
  </svelte:fragment>
  <div class="overflow-y-hidden px-10 pt-5">
    <slot />
  </div>
</AppShell>
