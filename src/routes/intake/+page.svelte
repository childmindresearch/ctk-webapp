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

<div class="container mx-auto max-w-2xl p-6">
    <!-- Header Section -->
    <div class="mb-8">
        <h3 class="h3 mb-4">Intake Reports</h3>
        <p class="text-surface-800 dark:text-surface-300 leading-relaxed">
            This page is used to generate intake reports for patients. Please enter the MRN you would like to generate a
            report for.
        </p>
    </div>

    <!-- Content Section -->
    <div class="card p-6 bg-surface-50 dark:bg-surface-800 shadow-lg">
        {#if isLoading}
            <div class="flex flex-col items-center space-y-4">
                <LoadingBar label="Loading... This may take a while." />
            </div>
        {:else}
            <form class="space-y-6" onsubmit={onSubmit}>
                <div class="form-group">
                    <span class="label-text font-medium text-surface-700 dark:text-surface-200"> MRN </span>
                    <input
                        class="input w-full max-w-md mt-2"
                        placeholder="Enter MRN"
                        bind:value={redcapSurveyId}
                        data-testid="intakeInput"
                        required
                        autocomplete="off"
                    />
                </div>

                <div class="flex justify-start pt-4">
                    <button
                        type="submit"
                        class="btn preset-filled-primary-500 min-w-32"
                        disabled={isLoading || !redcapSurveyId?.trim()}
                        data-testid="intakeSubmit"
                    >
                        Generate Report
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
