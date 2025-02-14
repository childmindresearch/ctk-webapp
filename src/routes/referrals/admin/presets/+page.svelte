<script lang="ts">
    import DataTable from "$lib/components/DataTable.svelte"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { unpackProviders } from "../../utils.js"

    let { data } = $props()
    let presets = data.presets
    let resetTable = $state(true)

    console.log(presets)

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    async function onCreate() {
        return await new Promise<(typeof presets)[number]>(resolve => {
            const modal: ModalSettings = {
                type: "component",
                component: "createPreset",
                title: `Create Preset`,
                response: response => {
                    if (!response) return
                    resolve(response)
                }
            }
            modalStore.trigger(modal)
        })
            .then(async response => {
                return await fetch("/api/referrals/presets", {
                    method: "POST",
                    body: JSON.stringify(response)
                })
            })
            .then(async response => {
                if (!response.ok) throw await response.text()
                presets.push(await response.json())
                resetTable = !resetTable
            })
            .catch(reason => {
                toastStore.trigger({
                    message: `Could not create: ${reason}.`,
                    background: "bg-error-500"
                })
            })
    }

    async function onEdit(row: { id: number }) {
        return await new Promise<typeof row>(resolve => {
            const modal: ModalSettings = {
                type: "component",
                component: "createPreset",
                meta: row,
                response: response => {
                    if (!response) return
                    resolve(response)
                }
            }
            modalStore.trigger(modal)
        })
            .then(async formData => {
                const response = await fetch(`/api/referrals/presets/${row.id}`, {
                    method: "PUT",
                    body: JSON.stringify(formData)
                })
                const index = presets.findIndex(tableRow => tableRow.id === row.id)
                if (index === -1) return
                presets[index] = await response.json()
                resetTable = !resetTable
            })
            .catch(reason => {
                toastStore.trigger({
                    message: `Could not edit: ${reason}.`,
                    background: "bg-error-500"
                })
            })
    }

    async function onDelete(row: { id: number; name: string }) {
        const modal: ModalSettings = {
            type: "confirm",
            title: "Delete Referral",
            body: `Are you sure you wish to delete ${row.name}?`,
            response: async (response: boolean) => {
                if (!response) return
                await fetch(`/api/referrals/presets/${row.id}`, {
                    method: "DELETE"
                })
                    .then(async response => {
                        if (!response.ok) throw await response.text()
                        presets = presets.filter(tableRow => tableRow.id !== row.id)
                        resetTable = !resetTable // Reactivity doesn't work well for deletions.
                    })
                    .catch(reason => {
                        toastStore.trigger({
                            message: `Could not delete: ${reason}.`,
                            background: "bg-error-500"
                        })
                    })
            }
        }
        modalStore.trigger(modal)
    }
</script>

{#key resetTable}
    <DataTable data={data.presets} unpack={unpackProviders} {onCreate} {onEdit} {onDelete} hiddenColumns={["id"]} />
{/key}
