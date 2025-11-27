<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import { isUnique } from "$lib/utils"
    import { toast } from "svelte-sonner"
    import ModalFilterGroupForm from "./ModalFilterGroupForm/ModalFilterGroupForm.svelte"
    import * as Dialog from "$lib/shadcn/components/ui/dialog"
    import z from "zod"
    import type { PostFilterGroup } from "$api/v1/referrals/filter-groups/schemas"
    import type { getFilterGroups } from "$api/v1/referrals/crud"
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
                    toast.error(`Could not create: ${await response.text()}`)
                    return
                }
                const newFilterGroup = (await response.json()) as Awaited<ReturnType<typeof getFilterGroups>>[number]
                filterGroups.push(newFilterGroup)
                toast.success("Filter group created successfully")
            })
            .catch(reason => {
                toast.error(`Could not create: ${reason}`)
            })
    }

    function onEditOpen(filterGroup: (typeof data.filterGroups)[number]) {
        isEditModalOpen = true
        editFilterGroup = filterGroup
    }

    async function onEditSubmit(newFilterGroup: typeof referralFilterGroups.$inferInsert) {
        if (!editFilterGroup) {
            toast.error("Could not find ID of edited row.")
            return
        }
        isEditModalOpen = false
        await fetch(`/api/referrals/filter-groups/${editFilterGroup.id}`, {
            method: "PUT",
            body: JSON.stringify(newFilterGroup)
        }).then(async response => {
            if (!response.ok) {
                toast.error("Failed to edit filter group.")
                return
            }
            toast.success("Filter group updated successfully")
            // Update the local state with the new data
            const index = filterGroups.findIndex(fg => fg.id === editFilterGroup?.id)
            if (index !== -1) {
                filterGroups[index] = { ...filterGroups[index], ...newFilterGroup }
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
                toast.error("Failed to delete filter group.")
                return
            }
            filterGroups = filterGroups.filter(fgroup => fgroup.id !== filterGroup.id)
            toast.success("Filter group deleted successfully")
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

<!-- Creation Modal -->
<Dialog.Root bind:open={isCreationModalOpen}>
    <Dialog.Content class="max-w-[48rem]">
        <Dialog.Header>
            <Dialog.Title>Create Filter Group</Dialog.Title>
        </Dialog.Header>
        <ModalFilterGroupForm filterGroup={{}} onSubmit={onCreate} {serviceAutoCompletions} {locationAutoCompletions} />
    </Dialog.Content>
</Dialog.Root>

<!-- Edit Modal -->
<Dialog.Root bind:open={isEditModalOpen}>
    <Dialog.Content class="max-w-[48rem]">
        <Dialog.Header>
            <Dialog.Title>Edit Filter Group</Dialog.Title>
        </Dialog.Header>
        {#if editFilterGroup}
            <ModalFilterGroupForm
                filterGroup={editFilterGroup}
                onSubmit={onEditSubmit}
                {serviceAutoCompletions}
                {locationAutoCompletions}
            />
        {/if}
    </Dialog.Content>
</Dialog.Root>
