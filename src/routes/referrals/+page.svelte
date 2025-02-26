<script lang="ts">
    import type { ExtendedProvider } from "$lib/server/types.js"
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton"

    let { data } = $props()

    const toastStore = getToastStore()
    let selectedPreset = $state(data.presets[0])

    async function onSubmit() {
        const providers = (await (await fetch(`/api/referrals/providers/presets/${selectedPreset.id}`)).json()) as ExtendedProvider[]
        if (providers.length === 0) return

        let title = selectedPreset.name
        const columns = ["name", "address", "phone", "description"] as const;
        const headers = ["Name", "Address", "Phone", "Description"] as const;
        const row_data = [
            headers,
            ...providers.map(prov =>
                columns.map(col => prov[col] ?? "")
            )
        ];

        await fetch("/api/referrals/document", {
            method: "POST",
            body: JSON.stringify({ title, row_data })
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
                    return
                }
                const toast: ToastSettings = {
                    message: "There was a problem connecting to the server.",
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                return
            })
            .catch(error => {
                const toast: ToastSettings = {
                    message: `There was a interpreting the server response: ${error}.`,
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                return
            })
    }
</script>

{#if data.user?.is_admin}
    <h4 class="h4">Admin Tools</h4>
    <a class="btn variant-filled-primary" href="/referrals/admin/presets">Modify presets</a>
    <a class="btn variant-filled-primary" href="/referrals/admin/providers">Modify providers</a>
    <hr class="my-2"/>
{/if}

<h4 class="h4">Referral Documents</h4>
<form onsubmit={onSubmit}>
    <select class="input max-w-72" bind:value={selectedPreset}>
        {#each data.presets as preset}
            <option value={preset}>
                {preset.name}
            </option>
        {/each}
    </select>
    <button class="btn variant-filled-primary" type="submit"> Export </button>
</form>
