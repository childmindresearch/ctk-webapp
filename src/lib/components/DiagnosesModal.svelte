<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import { getModalStore, getToastStore } from "@skeletonlabs/skeleton"

  const modalStore = getModalStore()
  let templates: string[] = $modalStore[0].meta.templates
  templates = templates.map(template => allUpperCaseUnderscoreToCapitalizedSpace(template))

  let values: string[] = Array(templates.length).fill("")

  const dispatch = createEventDispatcher()
  const toastStore = getToastStore()

  function allUpperCaseUnderscoreToCapitalizedSpace(input: string): string {
    return input
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  function onSubmit(event: Event) {
    event.preventDefault()
    if (values.some(value => value === "")) {
      toastStore.trigger({ message: "Please fill all the fields.", background: "variant-filled-error" })
      return
    }
    dispatch("submit", values)
  }
</script>

{#if $modalStore[0]}
  <div class="card p-4 w-modal shadow-xl space-y-4">
    <h3 class="h3">Checkout</h3>
    <label class="label">
      <div class="space-y-2">
        {#each templates as template, index}
          <div>
            <span>{template}</span>
            <input class="input" type="text" placeholder={template} bind:value={values[index]} />
          </div>
        {/each}
      </div>
    </label>
    <button class="btn variant-filled-primary" on:click={onSubmit}>Download</button>
  </div>
{/if}
