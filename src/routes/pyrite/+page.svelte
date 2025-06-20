<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"
    import { toaster } from "$lib/utils"

    let mrn = $state("")
    let isLoading = $state(false)

    async function onSubmit() {
        if (mrn === "") {
            toaster.error({
                title: "variant-filled-error"
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
                toaster.error({
                    title: "variant-filled-error"
                })
            })
        isLoading = false
    }
</script>

<h3 class="h3">Pyrite Reports</h3>

<p>
    This page is used to generate Pyrite reports. Please enter the MRN of the participant you would like to generate a
    report for.
</p>
{#if isLoading}
    <LoadingBar label="Loading... This may take a while." />
{:else}
    <form class="space-y-2">
        <label class="label">
            <span class="label-text">MRN</span>
            <input class="input w-72" placeholder="MRN" bind:value={mrn} data-testid="pyriteInput" />
        </label>

        <br />
        <button
            class="btn preset-filled-primary-500"
            onclick={onSubmit}
            disabled={isLoading}
            data-testid="pyriteSubmit"
        >
            Submit
        </button>
    </form>
{/if}
