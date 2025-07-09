<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import { toaster } from "$lib/utils.js"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import { type ProviderFormData } from "./utils.js"
    import ModalProviderForm from "./ModalProviderForm.svelte"
    import Filters from "./Filters.svelte"
    import ExportButton from "./ExportButton.svelte"

    let { data } = $props()
    console.log(data)

    let providers = $state(data.data)
    let isCreationModalOpen = $state(false)
    let isEditModalOpen = $state(false)
    let editModalData: Partial<ProviderFormData> = $state({})
    let filterDrawerState = $state(false)
    let serviceTypes = data.data.map(p => p.serviceType)
    type columnNames = keyof (typeof providers)[number]

    // Filters need to be bound in order to persist after opening/closing the drawer.
    let topLevelFilters: Partial<Record<string, string>> = $state({})
    let locationFilters: string[] = $state([])
    let participantAge: number | null = $state(null)

    const hiddenColumns: columnNames[] = [
        "id",
        "insuranceDetails",
        "minAge",
        "maxAge",
        "addresses",
        "subServices",
        "services"
    ] as const

    async function onCreate(data: ProviderFormData) {
        await fetch("/api/referrals/providers", {
            method: "POST",
            body: JSON.stringify(data)
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

    async function onEdit(data: ProviderFormData) {
        console.log(data)
        return await fetch(`/api/referrals/providers/${data.id}`, {
            method: "PUT",
            body: JSON.stringify(data)
        })
            .then(async response => {
                if (!response.ok) throw await response.text()
                const newProvider = await response.json()
                const oldProvider = providers.findIndex(prov => prov.id === data.id)
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
                providers={data.data}
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
                editModalData = {
                    ...data,
                    subServices: data.subServices?.map(sub => sub.name) || []
                }
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
        <ModalProviderForm provider={{}} onSubmit={onCreate} serviceTypeAutoCompletions={serviceTypes} />
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
        <ModalProviderForm provider={editModalData} onSubmit={onEdit} serviceTypeAutoCompletions={serviceTypes} />
    {/snippet}
</Modal>
