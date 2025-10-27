<script lang="ts">
  import { Button } from "$lib/components/ui/button"
  import { Label } from "$lib/components/ui/label"
  import { Card, CardContent, CardHeader } from "$lib/components/ui/card"
  import { Slider } from "$lib/components/ui/slider"
  import * as Command from "$lib/components/ui/command"
  import * as Popover from "$lib/components/ui/popover"
  import { cn } from "$lib/utils"
  import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-svelte"
  import { type ProviderFormData } from "../utils"
  import { isUnique } from "$lib/utils"

  type Props = {
    provider: ProviderFormData
    serviceAutoCompletions: string[]
    subServiceAutoCompletions: Record<(typeof serviceAutoCompletions)[number], string[]>
    onChange: (data: { service: string; subServices: string[]; minAge: number; maxAge: number }) => void
  }

  const { provider, serviceAutoCompletions, subServiceAutoCompletions, onChange = () => {} }: Props = $props()

  let service = $state(provider.service)
  let subServices = $state(provider.subServices)
  let minAge = $state(provider.minAge)
  let maxAge = $state(provider.maxAge)

  let openServiceCombobox = $state(false)
  let openSubServiceCombobox: Record<number, boolean> = $state({})

  let currentSubServiceAutoCompletions = $derived((subServiceAutoCompletions[service] || []).filter(isUnique))

  $inspect(provider)

  const serviceCompletions = serviceAutoCompletions.filter(isUnique)

  function emitChange() {
    onChange({ service, subServices, minAge, maxAge })
  }

  function addSubService() {
    subServices.push("")
    emitChange()
  }

  function removeSubService(index: number) {
    subServices = subServices.filter((_: any, i: number) => i !== index)
    emitChange()
  }

  function handleServiceSelect(value: string) {
    service = value
    openServiceCombobox = false
    emitChange()
  }

  function handleSubServiceSelect(index: number, value: string) {
    subServices[index] = value
    openSubServiceCombobox[index] = false
    emitChange()
  }

  function handleAgeChange(value: number[]) {
    minAge = value[0]
    maxAge = value[1]
    emitChange()
  }
</script>

<section>
  <Card class="border-l-4 border-l-secondary">
    <CardHeader class="space-y-0 pb-4">
      <div class="flex items-center gap-3">
        <div class="w-2 h-8 bg-secondary rounded-full"></div>
        <h3 class="text-2xl font-bold tracking-tight">Services Offered</h3>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Primary Service Type -->
      <div class="space-y-2">
        <Label class="text-sm font-semibold">Primary Service Type</Label>
        <Popover.Root bind:open={openServiceCombobox}>
          <Popover.Trigger>
            <Button variant="outline" role="combobox" class="w-full justify-between">
              {service || "Select or type a service"}
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </Popover.Trigger>
          <Popover.Content class="w-full p-0" style="z-index: 50;">
            <Command.Root>
              <Command.Input placeholder="Search services..." bind:value={service} />
              <Command.Empty>No service found.</Command.Empty>
              <Command.Group class="max-h-[300px] overflow-auto">
                {#each serviceCompletions as serviceOption}
                  <Command.Item value={serviceOption} onSelect={() => handleServiceSelect(serviceOption)}>
                    <Check class={cn("mr-2 h-4 w-4", service !== serviceOption && "text-transparent")} />
                    {serviceOption}
                  </Command.Item>
                {/each}
              </Command.Group>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
      </div>

      <!-- Subservices -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold">Subservices</h4>
          <Button variant="outline" size="sm" onclick={addSubService}>
            <Plus class="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>

        <div class="space-y-3">
          {#each subServices as subService, subservice_index}
            <div class="flex gap-3 items-center p-3 rounded-lg border bg-muted/50">
              <div class="flex-1">
                <Popover.Root bind:open={openSubServiceCombobox[subservice_index]}>
                  <Popover.Trigger>
                    <Button variant="outline" role="combobox" class="w-full justify-between">
                      {subServices[subservice_index] || "Select or type a sub-service"}
                      <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content class="w-full p-0" style="z-index: 50;">
                    <Command.Root>
                      <Command.Input placeholder="Search sub-services..." bind:value={subServices[subservice_index]} />
                      <Command.Empty>No sub-service found.</Command.Empty>
                      <Command.Group class="max-h-[300px] overflow-auto">
                        {#each currentSubServiceAutoCompletions as subServiceOption}
                          <Command.Item
                            value={subServiceOption}
                            onSelect={() => handleSubServiceSelect(subservice_index, subServiceOption)}
                          >
                            <Check
                              class={cn(
                                "mr-2 h-4 w-4",
                                subServices[subservice_index] !== subServiceOption && "text-transparent"
                              )}
                            />
                            {subServiceOption}
                          </Command.Item>
                        {/each}
                      </Command.Group>
                    </Command.Root>
                  </Popover.Content>
                </Popover.Root>
              </div>
              <Button variant="destructive" size="sm" onclick={() => removeSubService(subservice_index)}>
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          {/each}
        </div>
      </div>

      <!-- Age Range Slider -->
      <div class="space-y-3">
        <div class="space-y-1">
          <Label class="text-sm font-semibold">
            Age Range: {minAge || 0}-{maxAge || 120}
          </Label>
          <p class="text-sm text-muted-foreground">
            Note: Age range is inclusive on both sides i.e. "only minors" would be "0-17".
          </p>
        </div>
        <Slider
          type={"multiple"}
          min={0}
          max={120}
          step={1}
          value={[minAge || 0, maxAge || 120]}
          onValueChange={handleAgeChange}
          class="w-full"
        />
      </div>
    </CardContent>
  </Card>
</section>
