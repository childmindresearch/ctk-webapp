<script lang="ts">
    import EditIcon from "$lib/icons/EditIcon.svelte"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"

    export let dsmItem: { label: string; code: string; id: number }
    const instructions = "Edit the DSM code."

    const toastStore = getToastStore()
    const modalStore = getModalStore()

    async function onClick() {
        const modal: ModalSettings = {
            type: "component",
            component: "dsmForm",
            title: `Edit DSM Code`,
            meta: { instructions: instructions, code: dsmItem.code, label: dsmItem.label },
            response: async response => {
                if (!response) return
                await fetch(`/api/dsm/${dsmItem.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: response.code, label: response.label, id: dsmItem.id })
                }).then(result => {
                    if (!result.ok) {
                        toastStore.trigger({
                            message: `Failed to edit the DSM code: ${result.statusText}`,
                            background: "variant-filled-error"
                        })
                    } else {
                        dsmItem.code = response.code
                        dsmItem.label = response.label
                        toastStore.trigger({
                            message: `Editted the DSM code.`,
                            background: "variant-filled-success"
                        })
                    }
                })
            }
        }
        modalStore.trigger(modal)
    }
</script>

<button on:click={onClick} class="btn hover:variant-ghost-primary w-[1rem] h-[1.5rem]">
    <EditIcon class="text-warning-600" />
</button>
