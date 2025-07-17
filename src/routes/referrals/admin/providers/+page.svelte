<script lang="ts">
    import { createProviderSchema } from "$api/referrals/providers/schemas.js"
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import { isUnique, toaster } from "$lib/utils.js"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import { z } from "zod"
    import ExportButton from "./ExportButton.svelte"
    import Filters from "./Filters.svelte"
    import ModalProviderForm from "./ModalProviderForm/ModalProviderForm.svelte"

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
                toaster.success({
                    title: `Created provider.`
                })
            })
            .catch(reason => {
                toaster.error({
                    title: `Could not create provider.`,
                    description: reason
                })
            })
            .finally(() => (isCreationModalOpen = false))
    }

    async function onDelete(row: (typeof providers)[number]) {
        const confirmed = confirm(`Are you sure you wish to delete "${row.name}"?`)
        if (!confirmed) return

        await fetch(`/api/referrals/providers/${row.id}`, { method: "DELETE" }).then(response => {
            if (response.ok) {
                providers = providers.filter(prov => prov.id !== row.id)
                toaster.success({
                    title: `Deleted provider.`
                })
            } else {
                toaster.error({
                    title: "Could not delete provider"
                })
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
                toaster.success({
                    title: `Updated provider.`
                })
            })
            .catch(reason => {
                toaster.error({
                    title: `Could not edit provider.`,
                    description: reason
                })
            })
            .finally(() => (isEditModalOpen = false))
    }
</script>

<div class="z-0">
    <Modal
        open={filterDrawerState}
        onOpenChange={e => (filterDrawerState = e.open)}
        triggerBase="btn preset-filled-secondary-500"
        contentBase="bg-surface-50 p-4 space-y-4 shadow-xl w-[40rem] h-screen"
        positionerJustify="justify-end"
        positionerAlign=""
        backdropBackground="bg-surface-50/50"
        positionerPadding=""
        transitionsPositionerIn={{ x: -480, duration: 200 }}
        transitionsPositionerOut={{ x: -480, duration: 200 }}
    >
        {#snippet trigger()}Open filters{/snippet}
        {#snippet content()}
            <Filters
                providers={data.providers}
                onChange={p => (providers = p)}
                bind:topLevelFilters
                bind:locationFilters
                bind:participantAge
            />
        {/snippet}
    </Modal>

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
        <p>No providers found.</p>
        <button
            onclick={() => {
                isCreationModalOpen = true
            }}
            class="btn preset-filled-primary-500"
        >
            <span>Create</span>
        </button>
    {/if}
</div>

<!-- Creation Modal -->
<Modal
    open={isCreationModalOpen}
    onOpenChange={e => {
        isCreationModalOpen = e.open
    }}
    triggerBase="btn"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[48rem] max-w-[90vw]"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <ModalProviderForm
            provider={{}}
            onSubmit={onCreate}
            serviceAutoCompletions={services}
            locationAutoCompletions={locationsAutoCompletions}
            {subServiceAutoCompletions}
        />
    {/snippet}
</Modal>

<!-- Edit Modal -->
<Modal
    open={isEditModalOpen}
    onOpenChange={e => {
        isEditModalOpen = e.open
    }}
    triggerBase="btn"
    contentBase="card bg-surface-100-900 p-4 space-y-4 shadow-xl w-[48rem] max-w-[90vw]"
    backdropClasses="backdrop-blur-sm"
>
    {#snippet content()}
        <ModalProviderForm
            provider={editModalData!}
            onSubmit={data => onEdit(data)}
            serviceAutoCompletions={services}
            locationAutoCompletions={locationsAutoCompletions}
            {subServiceAutoCompletions}
        />
    {/snippet}
</Modal>
