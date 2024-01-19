<script lang="ts">
  import { browser } from "$app/environment"
  import type { skeletonThemes } from "$lib/utils"
  import { currentTheme } from "$lib/store"
  import { AppBar, LightSwitch, popup } from "@skeletonlabs/skeleton"

  interface Theme {
    type: skeletonThemes
    name: string
    icon: string
  }
  const themes: Theme[] = [
    { type: "skeleton", name: "Skeleton", icon: "💀" },
    { type: "wintry", name: "Wintry", icon: "🌨️" },
    { type: "modern", name: "Modern", icon: "🤖" },
    { type: "rocket", name: "Rocket", icon: "🚀" },
    { type: "seafoam", name: "Seafoam", icon: "🧜‍♀️" },
    { type: "vintage", name: "Vintage", icon: "📺" },
    { type: "sahara", name: "Sahara", icon: "🏜️" },
    { type: "hamlindigo", name: "Hamlindigo", icon: "👔" },
    { type: "gold-nouveau", name: "Gold Nouveau", icon: "💫" },
    { type: "crimson", name: "Crimson", icon: "⭕" }
  ]

  $: if (browser) {
    document.body.setAttribute("data-theme", $currentTheme)
  }
</script>

<AppBar shadow="shadow-2xl" slotTrail="!space-x-2">
  <svelte:fragment slot="lead">
    <a href="/">
      <strong class="text-xl">Clinician Toolkit</strong>
    </a>
  </svelte:fragment>
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
  <svelte:fragment slot="trail">
    <div>
      <button
        class="btn hover:variant-soft-primary"
        use:popup={{ event: "click", target: "theme", closeQuery: "a[href]" }}
      >
        <i class="fa-solid fa-palette text-lg md:!hidden" />
        <span class="font-semibold">Theme</span>
        <i class="fa-solid fa-caret-down opacity-50" />
      </button>
      <div class="card p-4 w-60 shadow-xl" data-popup="theme">
        <div class="space-y-4">
          <section class="flex justify-between items-center">
            <h6 class="h6">Mode</h6>
            <LightSwitch />
          </section>
          <hr />
          <nav class="list-nav pl-4 pr-4 -m-4 max-h-64 lg:max-h-[500px] overflow-y-auto">
            <ul>
              {#each themes as { icon, name, type }}
                <li>
                  <button
                    class="option w-full h-full"
                    type="submit"
                    on:click={() => currentTheme.set(type)}
                    name="theme"
                    value={type}
                    class:bg-primary-active-token={$currentTheme === type}
                  >
                    <span>{icon}</span>
                    <span class="flex-auto text-left">{name}</span>
                  </button>
                </li>
              {/each}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </svelte:fragment>
</AppBar>
