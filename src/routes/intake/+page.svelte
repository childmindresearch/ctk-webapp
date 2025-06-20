<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"
    import { onMount } from "svelte"
    import { toaster } from "$lib/utils"

    let redcapSurveyId = $state("")
    let isLoading = $state(false)
    let redcapIdentifierImage: HTMLImageElement

    const model = "anthropic.claude-3-5-sonnet-20241022-v2:0"

    onMount(() => {
        redcapIdentifierImage = new Image()
        redcapIdentifierImage.src = "redcap_identifier.png"
    })

    function onSubmit() {
        if (redcapSurveyId === "") {
            toaster.error({
                title: "Please enter an MRN."
            })
            return
        }
        isLoading = true
        const headers = new Headers()
        headers.set("X-Model", model)
        fetch(`/api/intake-report/${redcapSurveyId}`, { headers })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(await response.text())
                }
                return await response.blob()
            })
            .then(blob => {
                const filename = `${redcapSurveyId}_V0_CTK.docx`
                downloadBlob(blob, filename)
            })
            .catch(error => {
                toaster.error({
                    title: error.message
                })
                isLoading = false
            })
            .finally(() => {
                isLoading = false
            })
    }
</script>

<h3 class="h3">Intake Reports</h3>
<p>
    This page is used to generate intake reports for patients. Please enter the MRN of the patient you would like to
    generate a report for.
</p>
<br />
{#if isLoading}
    <LoadingBar label="Loading... This may take a while." />
{:else}
    <form class="space-y-2">
        <label class="label">
            <span class="label-text">MRN</span>
            <input class="input w-72" placeholder="MRN" bind:value={redcapSurveyId} data-testid="intakeInput" />
        </label>
        <br />
        <button
            class="btn preset-filled-primary-500"
            onclick={onSubmit}
            disabled={isLoading}
            data-testid="intakeSubmit"
        >
            Submit
        </button>
    </form>
{/if}
