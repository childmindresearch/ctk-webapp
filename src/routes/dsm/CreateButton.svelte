<script lang="ts">
    import type { SqlDsmCodeSchema } from "$lib/server/sql"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"

    type Props = { onCreate: (item: SqlDsmCodeSchema) => void }
    let { onCreate }: Props = $props()

    const instructions = "Create a new DSM code."

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    async function onClick() {
        const modal: ModalSettings = {
            type: "component",
            component: "dsmForm",
            title: `Create DSM Code`,
            meta: { instructions: instructions },
            response: async response => {
                if (!response) return
                await fetch(`/api/dsm`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: response.code, label: response.label })
                }).then(async result => {
                    if (!result.ok) {
                        toastStore.trigger({
                            message: `Failed to create the DSM code: ${result.statusText}`,
                            background: "variant-filled-error"
                        })
                    } else {
                        onCreate(await result.json())
                        toastStore.trigger({
                            message: `Created the DSM code.`,
                            background: "variant-filled-success"
                        })
                    }
                })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<button onclick={onClick} class="btn variant-filled-secondary">
    <span>Create DSM Code</span>
</button>
