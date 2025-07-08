<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"
    import { toaster } from "$lib/utils"
    import FormInput from "$lib/components/FormInput.svelte"

    let mrn = $state("")
    let isLoading = $state(false)

    async function onSubmit() {
        if (mrn === "") {
            toaster.error({
                title: "Did not find an MRN."
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
                    title: "Could not download report."
                })
            })
        isLoading = false
    }
</script>

<div class="container mx-auto max-w-2xl p-6">
    <!-- Header Section -->
    <div class="mb-8">
        <h3 class="h3 mb-4">Pyrite Reports</h3>
        <p class="text-surface-800 dark:text-surface-300 leading-relaxed">
            This page is used to generate Pyrite reports. Please enter the MRN you would like to generate a report for.
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
                <FormInput
                    label="MRN"
                    required
                    placeholder="Enter MRN"
                    bind:value={mrn}
                    data-testid="intakeInput"
                    autocomplete="off"
                />

                <div class="flex justify-start pt-4">
                    <button
                        type="submit"
                        class="btn preset-filled-primary-500 min-w-32"
                        disabled={isLoading || !mrn?.trim()}
                        data-testid="pyriteSubmit"
                    >
                        Generate Report
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
