<script lang="ts">
  import { AppBar, LightSwitch } from "@skeletonlabs/skeleton"
</script>

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
  <svelte:fragment slot="lead">
    <a href="/">
      <strong class="text-xl">Clinician Toolkit</strong>
    </a>
  </svelte:fragment>
  <svelte:fragment slot="trail">
    <nav class="nav">
      <a href="/diagnoses">
        <button class="btn hover:variant-soft-primary">
          <span>Diagnoses</span>
        </button>
      </a>
      <a href="/summarization">
        <button class="btn hover:variant-soft-primary">
          <span>Summarization</span>
        </button>
      </a>
    </nav>
    <LightSwitch />
  </svelte:fragment>
</AppBar>
