<script lang="ts">
    import type { getProviders } from "$api/v1/referrals/crud.js"
    import { downloadBlob } from "$lib/utils.js"
    import { toast } from "svelte-sonner"
    import { exportProviders } from "./utils"
    import { Spinner } from "$lib/shadcn/components/ui/spinner"

    type Props = {
        providers: Awaited<ReturnType<typeof getProviders>>
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
                toast.error(error.message)
            })
        await exportPromise
        exportPromise = null
    }
</script>

{#await exportPromise}
    <Spinner />
{:then}
    <button class="btn preset-filled-primary-500" onclick={onExport} disabled={exportPromise !== null}> Export </button>
{:catch}
    <p>An unknown error occurred. Contact a developer.</p>
{/await}
