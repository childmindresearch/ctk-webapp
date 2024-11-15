<script lang="ts">
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import QuestionMarkCircleIcon from "$lib/icons/QuestionMarkCircleIcon.svelte"
    import { downloadBlob } from "$lib/utils"
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"

    let redcapSurveyId = $state("")
    let isLoading = $state(false)
    let redcapIdentifierImage: HTMLImageElement

    const model = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    const toastStore = getToastStore()
    const modalStore = getModalStore()

    let modalOpen = $derived($modalStore.length > 0)

    onMount(() => {
        redcapIdentifierImage = new Image()
        redcapIdentifierImage.src = "redcap_identifier.png"
    })

    function explainMRN() {
        const modal: ModalSettings = {
            type: "alert",
            title: "MRN",
            body: "The MRN can be found in the top right corner of the intake form.",
            image: redcapIdentifierImage.src
        }
        modalStore.trigger(modal)
    }

    function onSubmit() {
        if (redcapSurveyId === "") {
            toastStore.trigger({
                background: "variant-filled-error",
                message: "Please enter an MRN."
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
                toastStore.trigger({
                    background: "variant-filled-error",
                    message: error.message
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
    <div class="flex space-x-1">
        <label for="redcapSurveyId">MRN</label>
        <button class="hover-highlight" onclick={explainMRN} disabled={modalOpen} tabindex="-1">
            <QuestionMarkCircleIcon />
        </button>
    </div>

    <form class="space-y-2">
        <input class="input w-72" placeholder="MRN" bind:value={redcapSurveyId} />
        <br />
        <button class="btn variant-filled-primary" onclick={onSubmit} disabled={isLoading}> Submit </button>
    </form>
{/if}
