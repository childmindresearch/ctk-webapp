<script lang="ts">
    import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
    import { onMount } from "svelte"
    import QuestionMarkIcon from "$lib/components/QuestionMarkIcon.svelte"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { downloadBlob } from "$lib/utils"

    let redcapSurveyId = ""
    let isLoading = false
    let modalOpen = false
    let redcapIdentifierImage: HTMLImageElement

    const toastStore = getToastStore()
    const modalStore = getModalStore()

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
        fetch(`/api/intake-report/${redcapSurveyId}`)
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

    $: modalOpen = $modalStore.length > 0
</script>

<h3 class="h3">Intake Reports</h3>
<p>
    This page is used to generate intake reports for patients. Please enter the MRN of the patient you would like to
    generate a report for.
</p>
<br />
<div class="flex space-x-1">
    <label for="redcapSurveyId">MRN</label>
    <button class="hover-highlight" on:click={explainMRN} disabled={modalOpen} tabindex="-1">
        <QuestionMarkIcon />
    </button>
</div>
<form class="space-y-2">
    <input class="input w-72" type="number" placeholder="MRN" bind:value={redcapSurveyId} />
    <br />
    <button class="btn variant-filled-primary" on:click={onSubmit} disabled={isLoading}> Submit </button>
</form>

{#if isLoading}
    <LoadingBar />
{/if}

<style>
    /* Remove the arrows from number inputs */
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
