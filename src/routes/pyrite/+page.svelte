<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"
    import { getToastStore } from "@skeletonlabs/skeleton"

    let mrn = $state("")
    let isLoading = $state(false)

    const toastStore = getToastStore()

    async function onSubmit() {
        if (mrn === "") {
            toastStore.trigger({
                background: "variant-filled-error",
                message: "Please enter an MRN."
            })
            return
        }
        isLoading = true
        await fetch(`/api/pyrite/${mrn}`)
            .then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text())
                }
                return await response.blob()
            })
            .then(blob => {
                const filename = `${mrn}_Pyrite_CTK.docx`
                downloadBlob(blob, filename)
            })
            .catch(error => {
                toastStore.trigger({
                    background: "variant-filled-error",
                    message: error.message
                })
            })
        isLoading = false
    }
</script>

<h3 class="h3">Pyrite Reports</h3>

<aside class="variant-ghost-error alert">
    <div class="alert-message">
        <h3 class="h3">Alpha Feature</h3>
        <p>
            This is an alpha feature. It should not be used for day-to-day operations. It may change, error, or break at
            any time.
        </p>
    </div>
</aside>

<p>
    This page is used to generate Pyrite reports. Please enter the MRN of the participant you would like to generate a
    report for.
</p>
{#if isLoading}
    <LoadingBar label="Loading... This may take a while." />
{:else}
    <form class="space-y-2">
        <input class="input w-72" placeholder="MRN" bind:value={mrn} data-testid="pyriteInput" />
        <br />
        <button class="btn variant-filled-primary" onclick={onSubmit} disabled={isLoading} data-testid="pyriteSubmit">
            Submit
        </button>
    </form>
{/if}
