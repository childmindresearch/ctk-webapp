<script lang="ts">
  import { AppBar } from "@skeletonlabs/skeleton"
</script>

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
  <svelte:fragment slot="lead">
    <a href="/" class="hide-at-420px">
      <img src="/cmi.svg" alt="Clinician Toolkit" class="w-28" />
    </a>
  </svelte:fragment>
  <nav class="nav">
    <a href="/intake">
      <button class="btn hover:variant-soft-primary">
        <span>Intake</span>
      </button>
    </a>
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
</AppBar>

<style>
  .hide-at-420px {
    @media (max-width: 420px) {
      display: none;
    }
  }
</style>
