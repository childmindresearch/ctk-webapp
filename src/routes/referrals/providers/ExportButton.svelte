<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import type { GetProviderResponse } from "$lib/types"
    import { downloadBlob, toaster } from "$lib/utils.js"
    import { exportProviders } from "./utils"

    type Props = {
        providers: GetProviderResponse
    }
    let { providers }: Props = $props()
    let exportPromise = $state(null as Promise<void> | null)

    async function onExport() {
        const body = exportProviders(providers)

        exportPromise = fetch("/api/referrals/document", { method: "POST", body: JSON.stringify(body) })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text())
                }
                return await response.blob()
            })
            .then(blob => {
                const filename = `referral_CTK.docx`
                downloadBlob(blob, filename)
            })
            .catch(error => {
                toaster.error({
                    title: error.message
                })
            })
        await exportPromise
        exportPromise = null
    }
</script>

{#await exportPromise}
    <LoadingBar />
{:then}
    <button class="btn preset-filled-primary-500" onclick={onExport} disabled={exportPromise !== null}> Export </button>
{:catch}
    <p>An unknown error occurred. Contact a developer.</p>
{/await}
