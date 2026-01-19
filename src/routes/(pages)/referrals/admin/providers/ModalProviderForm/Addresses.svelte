<script lang="ts">
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Input } from "$lib/shadcn/components/ui/input"
    import { Label } from "$lib/shadcn/components/ui/label"
    import { Card, CardContent, CardHeader } from "$lib/shadcn/components/ui/card"
    import { RadioGroup, RadioGroupItem } from "$lib/shadcn/components/ui/radio-group"
    import * as Command from "$lib/shadcn/components/ui/command"
    import * as Popover from "$lib/shadcn/components/ui/popover"
    import { slide } from "svelte/transition"
    import { Check, ChevronsUpDown, Plus, Trash2 } from "lucide-svelte"
    import type { getProviders } from "$api/v1/referrals/crud"
    import { toast } from "svelte-sonner"
    import { cn } from "$lib/shadcn/utils/utils"

    type Props = {
        addresses: Omit<Awaited<ReturnType<typeof getProviders>>[number]["addresses"][number], "id" | "providerId">[]
        locationAutoCompletions?: string[]
        onChange: (
            addrs: Omit<Awaited<ReturnType<typeof getProviders>>[number]["addresses"][number], "id" | "providerId">[]
        ) => void
    }

    let { addresses, locationAutoCompletions = [], onChange = () => {} }: Props = $props()

    let openCombobox: { [key: number]: boolean } = $state({})

    function addAddress() {
        addresses.push({
            addressLine1: null,
            addressLine2: null,
            locationType: "unknown",
            city: null,
            state: null,
            zipCode: null,
            contacts: [""],
            location: ""
        })
    }

    $effect(() => onChange(addresses))

    function removeAddress(index: number) {
        if (addresses.length < 2) {
            toast.error("Cannot remove the last address.")
            return
        }
        addresses = addresses.filter((_, i) => i !== index)
    }

    function addContact(address: (typeof addresses)[number]) {
        address.contacts.push("")
    }

    function removeContact(address: (typeof addresses)[number], index: number) {
        if (address.contacts.length < 2) {
            toast.error("Cannot remove the last contact.")
            return
        }
        address.contacts = address.contacts.filter((_: string, i: number) => i !== index)
    }

    function selectLocation(address_index: number, value: string) {
        addresses[address_index].location = value
        openCombobox[address_index] = false
    }
</script>

<section class="space-y-6">
    <Card class="border-l-4 border-l-primary">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
            <div class="flex items-center gap-3">
                <div class="w-2 h-8 bg-primary rounded-full"></div>
                <h3 class="text-2xl font-bold tracking-tight">Service Locations</h3>
            </div>
            <Button onclick={addAddress} size="sm">
                <Plus class="w-4 h-4 mr-2" />
                Add Location
            </Button>
        </CardHeader>

        <CardContent class="space-y-6">
            {#each addresses as address, address_index (address)}
                <Card class="border-l-4 border-l-primary/50">
                    <CardHeader class="flex flex-row items-center justify-between space-y-0">
                        <h4 class="text-lg font-semibold">Location {address_index + 1}</h4>
                        <Button variant="destructive" size="sm" onclick={() => removeAddress(address_index)}>
                            <Trash2 class="w-4 h-4 mr-2" />
                            Remove Location
                        </Button>
                    </CardHeader>

                    <CardContent class="space-y-6">
                        <!-- Location Type Radio Group -->
                        <div class="space-y-3">
                            <Label class="text-sm font-semibold">
                                Location Type <span class="text-destructive">*</span>
                            </Label>
                            <RadioGroup bind:value={address.locationType} class="space-y-2">
                                {#each [{ value: "in-person", label: "Physical Location" }, { value: "hybrid", label: "Hybrid" }, { value: "remote", label: "Remote/Virtual Location" }, { value: "unknown", label: "Unknown" }] as option (option)}
                                    <div class="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent">
                                        <RadioGroupItem value={option.value} id={`${address_index}-${option.value}`} />
                                        <Label
                                            for={`${address_index}-${option.value}`}
                                            class="flex-1 cursor-pointer font-normal"
                                        >
                                            {option.label}
                                        </Label>
                                    </div>
                                {/each}
                            </RadioGroup>
                        </div>

                        <!-- Location Name Combobox -->
                        <div transition:slide={{ duration: 200 }} class="space-y-4">
                            <div class="space-y-2">
                                <Label class="text-sm font-semibold">
                                    Location Name <span class="text-destructive">*</span>
                                </Label>
                                <Popover.Root bind:open={openCombobox[address_index]}>
                                    <Popover.Trigger>
                                        <Button variant="outline" role="combobox" class="w-full justify-between">
                                            {address.location || "Select or type a location"}
                                            <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </Popover.Trigger>
                                    <Popover.Content class="w-full p-0">
                                        <Command.Root>
                                            <Command.Input
                                                placeholder="e.g., Brooklyn, Manhattan"
                                                bind:value={address.location}
                                            />
                                            <Command.Empty>No location found.</Command.Empty>
                                            <Command.Group>
                                                {#each locationAutoCompletions as location (location)}
                                                    <Command.Item
                                                        value={location}
                                                        onSelect={() => selectLocation(address_index, location)}
                                                    >
                                                        <Check
                                                            class={cn(
                                                                "mr-2 h-4 w-4",
                                                                address.location !== location && "text-transparent"
                                                            )}
                                                        />
                                                        {location}
                                                    </Command.Item>
                                                {/each}
                                            </Command.Group>
                                        </Command.Root>
                                    </Popover.Content>
                                </Popover.Root>
                            </div>

                            <!-- Address Fields -->
                            <div class="space-y-2">
                                <Label for={`address1-${address_index}`}>
                                    Address Line 1
                                    {#if address.locationType !== "remote"}
                                        <span class="text-destructive">*</span>
                                    {/if}
                                </Label>
                                <Input
                                    id={`address1-${address_index}`}
                                    placeholder="Enter street address"
                                    required={address.locationType !== "remote"}
                                    bind:value={address.addressLine1}
                                />
                            </div>

                            <div class="space-y-2">
                                <Label for={`address2-${address_index}`}>Address Line 2</Label>
                                <Input
                                    id={`address2-${address_index}`}
                                    placeholder="Apt, suite, unit, etc..."
                                    bind:value={address.addressLine2}
                                />
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="space-y-2">
                                    <Label for={`city-${address_index}`}>
                                        City
                                        {#if address.locationType !== "remote"}
                                            <span class="text-destructive">*</span>
                                        {/if}
                                    </Label>
                                    <Input
                                        id={`city-${address_index}`}
                                        placeholder="City"
                                        required={address.locationType !== "remote"}
                                        bind:value={address.city}
                                    />
                                </div>

                                <div class="space-y-2">
                                    <Label for={`state-${address_index}`}>
                                        State
                                        {#if address.locationType !== "remote"}
                                            <span class="text-destructive">*</span>
                                        {/if}
                                    </Label>
                                    <Input
                                        id={`state-${address_index}`}
                                        placeholder="State"
                                        required={address.locationType !== "remote"}
                                        bind:value={address.state}
                                    />
                                </div>

                                <div class="space-y-2">
                                    <Label for={`zip-${address_index}`}>
                                        Zip Code
                                        {#if address.locationType !== "remote"}
                                            <span class="text-destructive">*</span>
                                        {/if}
                                    </Label>
                                    <Input
                                        id={`zip-${address_index}`}
                                        placeholder="Zip Code"
                                        required={address.locationType !== "remote"}
                                        bind:value={address.zipCode}
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Contacts Section -->
                        <div class="space-y-4 pt-6 border-t">
                            <div class="flex items-center justify-between">
                                <h4 class="text-lg font-semibold">Contact Information</h4>
                                <Button variant="outline" size="sm" onclick={() => addContact(address)}>
                                    <Plus class="w-4 h-4 mr-2" />
                                    Add Contact
                                </Button>
                            </div>

                            <div class="space-y-3">
                                {#if address.contacts}
                                    {#each address.contacts as contact, contact_index (contact)}
                                        <div class="flex gap-3 items-end p-4 rounded-lg border bg-muted/50">
                                            <div class="flex-1 space-y-2">
                                                <Label for={`contact-${address_index}-${contact_index}`}>
                                                    Contact {contact_index + 1}
                                                    <span class="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id={`contact-${address_index}-${contact_index}`}
                                                    placeholder="Phone, email, website, etc..."
                                                    required
                                                    bind:value={address.contacts[contact_index]}
                                                />
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onclick={() => removeContact(address, contact_index)}
                                            >
                                                <Trash2 class="w-4 h-4" />
                                            </Button>
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </CardContent>
    </Card>
</section>
