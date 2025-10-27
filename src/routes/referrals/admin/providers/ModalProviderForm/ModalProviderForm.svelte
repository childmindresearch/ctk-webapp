<script lang="ts">
  import { type ProviderFormData } from "../utils"
  import FormInput from "$lib/components/FormInput.svelte"
  import { slide } from "svelte/transition"
  import { createProviderSchema } from "$api/referrals/providers/schemas"
  import { z } from "zod"
  import Addresses from "./Addresses.svelte"
  import Services from "./Services.svelte"

  type Props = {
    provider: Partial<ProviderFormData>
    onSubmit: (provider: z.infer<typeof createProviderSchema>) => void
    serviceAutoCompletions?: string[]
    locationAutoCompletions?: string[]
    subServiceAutoCompletions?: Record<(typeof serviceAutoCompletions)[number], string[]>
  }
  let {
    provider: initialProvider,
    onSubmit,
    serviceAutoCompletions = [],
    locationAutoCompletions = [],
    subServiceAutoCompletions = {}
  }: Props = $props()

  let provider = $state({
    name: "",
    acceptsInsurance: false,
    notes: "",
    insuranceDetails: "",
    minAge: 0,
    maxAge: 120,
    addresses: [],
    service: "",
    subServices: [],
    ...initialProvider
  })

  $effect(() => {
    if (!provider.acceptsInsurance) {
      provider.insuranceDetails = ""
    }
  })

  function localOnSubmit(event: Event) {
    event.preventDefault()
    onSubmit(provider)
  }
</script>

<div class="max-w-4xl mx-auto p-6">
  <form onsubmit={localOnSubmit} class="overflow-y-auto max-h-[95vh]">
    <!-- Provider Section -->
    <section class="card p-6 space-y-6 variant-glass-surface">
      <div class="flex items-center gap-3 border-b border-surface-300-600-token pb-3">
        <div class="w-2 h-8 bg-primary-500 rounded-full"></div>
        <h3 class="h3 text-primary-700-200-token">Provider Information</h3>
      </div>

      <div class="grid gap-6">
        <FormInput label="Provider Name" required placeholder="Enter provider name" bind:value={provider.name} />

        <div class="space-y-4">
          <label class="flex items-center space-x-3 cursor-pointer">
            <input class="checkbox" type="checkbox" bind:checked={provider.acceptsInsurance} />
            <span class="text-sm font-semibold text-surface-700-200-token">Accepts Insurance</span>
          </label>

          {#if provider.acceptsInsurance}
            <div transition:slide={{ duration: 200 }}>
              <FormInput
                label="Insurance Details"
                required
                bind:value={provider.insuranceDetails}
                placeholder="Enter accepted insurance types, coverage details, etc."
                labelClass="ml-6"
              />
            </div>
          {/if}
        </div>

        <FormInput label="Notes" bind:value={provider.notes} placeholder="Additional notes" />
      </div>
    </section>

    <Services
      {provider}
      {serviceAutoCompletions}
      {subServiceAutoCompletions}
      onChange={data => {
        provider = { ...provider, ...data }
      }}
    />
    <Addresses
      addresses={provider.addresses}
      {locationAutoCompletions}
      onChange={addrs => (provider.addresses = addrs)}
    />

    <!-- Submit Section -->
    <div class="flex justify-end pt-6 border-t border-surface-300-600-token">
      <button class="btn preset-filled-secondary-500 text-md" type="submit"> Submit </button>
    </div>
  </form>
</div>
