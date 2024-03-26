<script lang="ts">
  import { getModalStore, getToastStore, type ModalSettings } from "@skeletonlabs/skeleton"
  import { API_ROUTE } from "$lib/api"
  import QuestionMarkIcon from "$lib/components/QuestionMarkIcon.svelte"
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import { downloadBlob } from "$lib/utils"
  import { dev } from "$app/environment"
  import DevelopmentPage from "$lib/components/DevelopmentPage.svelte"

  let redcapSurveyId = ""
  let files: FileList
  let isLoading = false

  const toastStore = getToastStore()
  const modalStore = getModalStore()
  let modalOpen = false

  function explainRedcapIdentifier() {
    const modal: ModalSettings = {
      type: "alert",
      title: "Redcap Identifier",
      body: "The redcap identifier can be found in the top right corner of the intake form.",
      image: "redcap_identifier.png"
    }
    modalStore.trigger(modal)
  }

  function onSubmit() {
    if (!redcapSurveyId || !files.length) {
      toastStore.trigger({
        background: "variant-filled-error",
        message: "Please fill out all fields."
      })
      return
    }

    const formData = new FormData()
    formData.append("csv_file", files[0])
    formData.append("redcap_survery_identifier", redcapSurveyId)

    isLoading = true
    fetch(`${API_ROUTE}/file_conversion/intake2docx`, {
      method: "POST",
      body: formData
    })
      .then(async res => await res.blob())
      .then(blob => {
        const filename = `${redcapSurveyId}_V0_CTK.docx`
        downloadBlob(blob, filename)
      })
      .catch(() => {
        toastStore.trigger({
          background: "variant-filled-error",
          message: "Error submitting intake."
        })
      })
      .finally(() => {
        isLoading = false
      })
  }

  $: modalOpen = $modalStore.length > 0
</script>

<DevelopmentPage>
  <form class="space-y-2">
    <label for="files">Redcap .csv file</label>
    <input type="file" bind:files accept=".csv" />
    <div class="flex space-x-1">
      <label for="redcapSurveyId">Redcap survey ID</label>
      <button class="hover-highlight" on:click={explainRedcapIdentifier} disabled={modalOpen}>
        <QuestionMarkIcon />
      </button>
    </div>
    <input class="input" type="text" placeholder="Redcap survey ID" bind:value={redcapSurveyId} />
    <button class="btn variant-filled-primary" on:click={onSubmit} disabled={isLoading}> Submit </button>
  </form>

  {#if isLoading}
    <LoadingBar />
  {/if}
</DevelopmentPage>
