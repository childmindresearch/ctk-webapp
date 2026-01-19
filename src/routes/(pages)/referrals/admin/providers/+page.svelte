<script lang="ts">
    import { createProviderSchema } from "$api/v1/referrals/providers/schemas.js"
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import { isUnique } from "$lib/utils.js"
    import * as Dialog from "$lib/shadcn/components/ui/dialog"
    import * as Sheet from "$lib/shadcn/components/ui/sheet"
    import { Button } from "$lib/shadcn/components/ui/button"
    import { z } from "zod"
    import ExportButton from "./ExportButton.svelte"
    import Filters from "./Filters.svelte"
    import ModalProviderForm from "./ModalProviderForm/ModalProviderForm.svelte"
    import { toast } from "svelte-sonner"

    let { data } = $props()

    let providers = $state(data.providers)
    let isCreationModalOpen = $state(false)
    let isEditModalOpen = $state(false)
    let editModalData: (typeof providers)[number] | undefined = $state(undefined)
    let filterDrawerState = $state(false)
    let editId = $state(-1)

    let services = $derived(data.providers.map(p => p.service).filter(isUnique))
    let locationsAutoCompletions = $derived(
        data.providers
            .map(p => p.addresses.map(addr => addr.location))
            .flat()
            .filter(isUnique)
    )
    let subServiceAutoCompletions = $derived(
        Object.fromEntries(
            Object.entries(
                data.providers.reduce(
                    (acc, provider) => {
                        if (!acc[provider.service]) {
                            acc[provider.service] = new Set<string>()
                        }
                        provider.subServices?.forEach(subserv => acc[provider.service].add(subserv))
                        return acc
                    },
                    {} as Record<string, Set<string>>
                )
            ).map(([key, set]) => [key, Array.from(set)])
        )
    ) as Record<string, string[]>

    // Filters need to be bound in order to persist after opening/closing the drawer.
    let topLevelFilters: Partial<Record<string, string>> = $state({})
    let locationFilters: string[] = $state([])
    let participantAge: number | null = $state(null)

    type columnNames = keyof (typeof providers)[number]
    const hiddenColumns: columnNames[] = [
        "id",
        "insuranceDetails",
        "minAge",
        "maxAge",
        "addresses",
        "subServices",
        "service"
    ] as const

    async function onCreate(form: z.infer<typeof createProviderSchema>) {
        await fetch("/api/referrals/providers", {
            method: "POST",
            body: JSON.stringify(form)
        })
            .then(async response => {
                if (!response.ok) throw await response.text()
                const newProvider = await response.json()
                providers.push(newProvider)
                toast.success("Created provider.")
            })
            .catch(() => {
                toast.error("Could not create provider.")
            })
            .finally(() => (isCreationModalOpen = false))
    }

    async function onDelete(row: (typeof providers)[number]) {
        const confirmed = confirm(`Are you sure you wish to delete "${row.name}"?`)
        if (!confirmed) return
        await fetch(`/api/referrals/providers/${row.id}`, { method: "DELETE" }).then(response => {
            if (response.ok) {
                providers = providers.filter(prov => prov.id !== row.id)
                toast.success("Deleted provider.")
            } else {
                toast.error("Could not delete provider")
            }
        })
    }

    async function onEdit(data: z.infer<typeof createProviderSchema>) {
        return await fetch(`/api/referrals/providers/${editId}`, {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(async response => {
                if (!response.ok) throw await response.text()
                const newProvider = await response.json()
                const oldProvider = providers.findIndex(prov => prov.id === editId)
                if (oldProvider !== -1) {
                    providers[oldProvider] = newProvider
                }
                toast.success("Updated provider.")
            })
            .catch(reason => {
                toast.error("Could not edit provider.", {
                    description: reason
                })
            })
            .finally(() => (isEditModalOpen = false))
    }
</script>

<div class="z-0">
    <Sheet.Root bind:open={filterDrawerState}>
        <Sheet.Trigger>
            <Button variant="secondary">Open filters</Button>
        </Sheet.Trigger>
        <Sheet.Content side="right" class="w-[40rem] overflow-y-auto">
            <Sheet.Header>
                <Sheet.Title>Filters</Sheet.Title>
            </Sheet.Header>
            <div class="py-4">
                <Filters
                    providers={data.providers}
                    onChange={p => (providers = p)}
                    bind:topLevelFilters
                    bind:locationFilters
                    bind:participantAge
                />
            </div>
        </Sheet.Content>
    </Sheet.Root>

    {#if providers.length > 0}
        <ExportButton {providers} />
        <DataTable
            data={providers}
            onCreate={() => {
                isCreationModalOpen = true
            }}
            {onDelete}
            onEdit={data => {
                editId = data.id
                editModalData = data
                isEditModalOpen = true
            }}
            idColumn="id"
            {hiddenColumns}
        />
    {:else}
        <p class="text-muted-foreground mb-4">No providers found.</p>
        <Button onclick={() => (isCreationModalOpen = true)}>Create</Button>
    {/if}
</div>

<!-- Creation Modal -->
<Dialog.Root bind:open={isCreationModalOpen}>
    <Dialog.Content class="max-w-[48rem]">
        <Dialog.Header>
            <Dialog.Title>Create Provider</Dialog.Title>
        </Dialog.Header>
        <ModalProviderForm
            provider={{}}
            onSubmit={onCreate}
            serviceAutoCompletions={services}
            locationAutoCompletions={locationsAutoCompletions}
            {subServiceAutoCompletions}
        />
    </Dialog.Content>
</Dialog.Root>

<!-- Edit Modal -->
<Dialog.Root bind:open={isEditModalOpen}>
    <Dialog.Content class="max-w-[48rem]">
        <Dialog.Header>
            <Dialog.Title>Edit Provider</Dialog.Title>
        </Dialog.Header>
        <ModalProviderForm
            provider={editModalData!}
            onSubmit={data => onEdit(data)}
            serviceAutoCompletions={services}
            locationAutoCompletions={locationsAutoCompletions}
            {subServiceAutoCompletions}
        />
    </Dialog.Content>
</Dialog.Root>
