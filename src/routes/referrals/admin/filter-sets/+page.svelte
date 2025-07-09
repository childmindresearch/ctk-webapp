<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import { isUnique } from "$lib/utils"
    import ModalFilterSetForm from "./ModalFilterSetForm.svelte"
    import { Modal } from "@skeletonlabs/skeleton-svelte"
    import type { FilterSetFormData } from "./utils"

    const { data } = $props()

    $inspect(data)
    let isCreationModalOpen = $state(false)
    const serviceAutoCompletions = data.providers
        .map(provider => {
            return provider.serviceType
        })
        .filter(isUnique)
    const locationAutoCompletions = data.providers
        .map(provider => {
            return provider.addresses.map(addr => {
                return addr.location
            })
        })
        .flat()
        .filter(isUnique)

    function onCreate(data: FilterSetFormData) {
        isCreationModalOpen = true
    }

    function onEdit(filterSet: (typeof data.filterSets)[number]) {
        // Not implemented
    }

    function onDelete(filterSet: (typeof data.filterSets)[number]) {
        // Not Implemented
    }
</script>

<DataTable
    data={data.filterSets}
    idColumn="id"
    hiddenColumns={["id"]}
    onCreate={() => (isCreationModalOpen = true)}
    {onEdit}
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
        <ModalFilterSetForm filterSet={{}} onSubmit={onCreate} {serviceAutoCompletions} {locationAutoCompletions} />
    {/snippet}
</Modal>
