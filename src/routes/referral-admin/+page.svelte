<script lang="ts">
    import DataTable from "$lib/components/DataTable/DataTable.svelte"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { getModalStore, getToastStore, type ModalSettings, type ToastSettings } from "@skeletonlabs/skeleton"

    let { data } = $props()

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    let providers = $state(data.providers)
    let loading = $state(false)

    let resetTable = $state(false)

    async function onCreate() {
        return await new Promise<(typeof providers)[number]>(resolve => {
            const modal: ModalSettings = {
                type: "component",
                component: "createReferral",
                title: `Create Referral`,
                response: response => {
                    if (!response) return
                    resolve(response)
                }
            }
            modalStore.trigger(modal)
        })
            .then(async response => {
                return await fetch("/api/referrals/providers", {
                    method: "POST",
                    body: JSON.stringify(response)
                })
            })
            .then(async response => {
                providers.push(await response.json())
            })
            .catch(reason => {
                toastStore.trigger({
                    message: `Could not create: ${reason}.`,
                    background: "bg-error-500"
                })
            })
    }

    async function onEdit(row: { id: number }) {
        await new Promise<typeof row>(resolve => {
            const modal: ModalSettings = {
                type: "component",
                component: "createReferral",
                meta: row,
                response: response => {
                    if (!response) return
                    resolve(response)
                }
            }
            modalStore.trigger(modal)
        })
            .then(async response => {
                return await fetch(`/api/referrals/providers/${row.id}`, {
                    method: "PUT",
                    body: JSON.stringify(response)
                })
            })
            .then(async response => {
                const index = providers.findIndex(tableRow => tableRow.id === row.id)
                if (!index) return
                providers[index] = await response.json()
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
                await fetch(`/api/referrals/providers/${row.id}`, {
                    method: "DELETE"
                })
                    .then(async response => {
                        console.log(response)
                        if (!response.ok) throw await response.text()
                        providers = providers.filter(tableRow => tableRow.id !== row.id)
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

    async function onExport(rows: Record<string, any>[]) {
        if (rows.length === 0) return

        loading = true
        // @ts-expect-error - we know all columns exist on these rows and that they are indexable.
        const columns: (keyof (typeof providers)[number])[] = Object.keys(rows[0])
        let markdown = "| " + columns.join(" | ") + " |\n"
        markdown += "| " + Array(columns.length).fill("------").join(" | ") + " |\n"
        rows.forEach(row => {
            markdown += "| " + columns.map(col => row[col]).join(" | ") + " |\n"
        })

        let markdown2docxForm = new FormData()
        markdown2docxForm.append("markdown", markdown)

        await fetch("/api/markdown2docx", {
            method: "POST",
            body: markdown2docxForm
        })
            .then(async response => {
                if (response.ok) {
                    const blob = await response.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "referrals.docx"
                    a.click()
                    URL.revokeObjectURL(url)
                    loading = false
                    return
                }
                const toast: ToastSettings = {
                    message: "There was a problem connecting to the server.",
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                loading = false
                return
            })
            .catch(error => {
                const toast: ToastSettings = {
                    message: `There was a interpreting the server response: ${error}.`,
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                loading = false
                return
            })
    }
</script>

<div class="z-0">
    {#if providers.length > 0}
        {#key resetTable}
            <DataTable data={providers} {onExport} {onCreate} {onEdit} {onDelete} hiddenColumns={["id"]} />
        {/key}
    {:else}
        <p>Error: No providers found.</p>
    {/if}
</div>
<LoadingBar hidden={!loading} />
