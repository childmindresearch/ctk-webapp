<script lang="ts">
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Card, CardContent } from "$lib/shadcn/components/ui/card"
    import { downloadBlob, FetchError } from "$lib/utils"
    import { toast } from "svelte-sonner"
    import { Spinner } from "$lib/shadcn/components/ui/spinner"
    import FormInput from "$lib/components/FormInput.svelte"
    import { GetIntakeDownload } from "$api/v1"

    let redcapSurveyId = $state("")
    let isLoading = $state(false)

    async function onSubmit() {
        if (redcapSurveyId === "") {
            toast.error("Please enter an MRN.")
            return
        }
        isLoading = true
        await GetIntakeDownload.fetch({ pathArgs: [redcapSurveyId] })
            .then(result => {
                if (result instanceof FetchError) {
                    toast.error(`Could not download intake report: ${result.message}.`)
                    return
                }

                const filename = `${redcapSurveyId}_V0_CTK.docx`
                downloadBlob(result, filename)
            })
            .catch(() => {
                toast.error("Could not download report.")
            })
            .finally(() => {
                isLoading = false
            })
    }
</script>

<div class="container mx-auto max-w-2xl p-6">
    <div class="mb-8">
        <h3 class="text-3xl font-semibold tracking-tight mb-4">Intake Reports</h3>
        <p class="text-muted-foreground leading-relaxed">
            This page is used to generate intake reports for patients. Please enter the MRN you would like to generate a
            report for.
        </p>
    </div>

    <Card>
        <CardContent class="pt-6">
            {#if isLoading}
                <div class="flex flex-col items-center space-y-4" data-testid="div-spinner">
                    <Spinner />
                </div>
            {:else}
                <form
                    onsubmit={e => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    <FormInput
                        label="MRN"
                        id="mrn"
                        type="text"
                        required
                        placeholder="Enter MRN"
                        bind:value={redcapSurveyId}
                        data-testid="intakeInput"
                        autocomplete="off"
                    />
                    <div class="flex justify-start pt-4">
                        <Button
                            type="submit"
                            class="min-w-32"
                            disabled={isLoading || !redcapSurveyId?.trim()}
                            data-testid="intakeSubmit"
                        >
                            Generate Report
                        </Button>
                    </div>
                </form>
            {/if}
        </CardContent>
    </Card>
</div>
