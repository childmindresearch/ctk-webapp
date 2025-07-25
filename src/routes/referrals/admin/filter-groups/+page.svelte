<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import { isUnique, toaster } from "$lib/utils"
    import ModalFilterGroupForm from "./ModalFilterGroupForm/ModalFilterGroupForm.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import z from "zod"
    import type { PostFilterGroup } from "$api/referrals/filter-groups/schemas"
    import type { getFilterGroups } from "$api/referrals/crud"
    import type { referralFilterGroups } from "$lib/server/db/schema.js"

    const { data } = $props()

    let filterGroups = $state(data.filterGroups)

    let isCreationModalOpen = $state(false)
    let isEditModalOpen = $state(false)
    let editFilterGroup: typeof referralFilterGroups.$inferInsert | undefined = $state(undefined)

    let serviceAutoCompletions = data.providers
        .map(provider => {
            return provider.service
        })
        .filter(isUnique)

    let locationAutoCompletions = data.providers
        .map(provider => {
            return provider.addresses.map(addr => {
                return addr.location
            })
        })
        .flat()
        .filter(isUnique)

    async function onCreate(formData: z.infer<typeof PostFilterGroup>) {
        isCreationModalOpen = false
        await fetch("/api/referrals/filter-groups", {
            method: "POST",
            body: JSON.stringify(formData)
        })
            .then(async response => {
                if (!response.ok) {
                    toaster.error({ title: `Could not create: ${await response.text()}` })
                    return
                }
                const newFilterGroup = (await response.json()) as Awaited<ReturnType<typeof getFilterGroups>>[number]
                filterGroups.push(newFilterGroup)
            })
            .catch(reason => {
                toaster.error({ title: `Could not create: ${reason}` })
            })
    }

    function onEditOpen(filterGroup: (typeof data.filterGroups)[number]) {
        isEditModalOpen = true
        editFilterGroup = filterGroup
    }

    async function onEditSubmit(newFilterGroup: typeof referralFilterGroups.$inferInsert) {
        if (!editFilterGroup) {
            toaster.error({ title: "Could not find ID of editted row." })
            return
        }
        isEditModalOpen = false
        await fetch(`/api/referrals/filter-groups/${editFilterGroup.id}`, {
            method: "PUT",
            body: JSON.stringify(newFilterGroup)
        }).then(async response => {
            if (!response.ok) {
                toaster.error({ title: "Failed to edit." })
                return
            }
        })
    }

    async function onDelete(filterGroup: (typeof data.filterGroups)[number]) {
        const confirmed = confirm(`Are you sure you wish to delete "${filterGroup.name}"?`)
        if (!confirmed) return

        await fetch(`/api/referrals/filter-groups/${filterGroup.id}`, {
            method: "DELETE"
        }).then(async response => {
            if (!response.ok) {
                toaster.error({ title: `Failed to delete.` })
                return
            }
            filterGroups = filterGroups.filter(fgroup => fgroup.id !== filterGroup.id)
        })
    }
</script>

<DataTable
    data={filterGroups}
    idColumn="id"
    hiddenColumns={["id", "filterSets"]}
    onCreate={() => (isCreationModalOpen = true)}
    onEdit={onEditOpen}
    {onDelete}
/>

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
        <ModalFilterGroupForm filterGroup={{}} onSubmit={onCreate} {serviceAutoCompletions} {locationAutoCompletions} />
    {/snippet}
</Modal>

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
        {#if editFilterGroup}
            <ModalFilterGroupForm
                filterGroup={editFilterGroup}
                onSubmit={onEditSubmit}
                {serviceAutoCompletions}
                {locationAutoCompletions}
            />
        {/if}
    {/snippet}
</Modal>
