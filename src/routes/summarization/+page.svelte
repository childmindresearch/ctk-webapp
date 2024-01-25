<!--
  This component is responsible for rendering the UI for the summarization page.
  It contains a button to upload the clinical report, a textarea to display the anonymized report,
  a checkbox to verify that the anonymization process was successful, and a button to submit the
  anonymized report for summarization.
-->

<script lang="ts">
  import LoadingBar from "$lib/components/LoadingBar.svelte"
  import { anonymizedReport } from "$lib/store"
  import { handleAnonymization, handleSummarization } from "./requests"

  let verified = false
  let correctedAnonymizedDocument: string = ""
  let summarizedPromise: Promise<void> | undefined = undefined

  $: $anonymizedReport,
    $anonymizedReport
      .then(anonymizedText => {
        correctedAnonymizedDocument = anonymizedText.replace(/\\n/g, "\n").replace(/"/g, "")
      })
      .catch(error => {
        console.error("Error in anonymization:", error)
      })

  function handleAnonymizedTextChange(e: Event) {
    const target = e.target as HTMLTextAreaElement
    correctedAnonymizedDocument = target.value
  }

  async function summarize(text: string) {
    summarizedPromise = handleSummarization(text)
    await summarizedPromise
    summarizedPromise = undefined
  }
</script>

<p>
  Please upload the clinical report to proceed with the summarization process. The report will be anonymized before
  being sent for summarization.
</p>
<div>
  <button class="btn variant-filled-primary" on:click={handleAnonymization}>Upload</button>
</div>

{#await $anonymizedReport}
  <LoadingBar />
{:then _}
  {#if correctedAnonymizedDocument}
    <h4 class="h4">Anonymized Report:</h4>
    <textarea
      class="textarea"
      rows="10"
      id="summary-id"
      name="summary"
      value={correctedAnonymizedDocument}
      on:change={handleAnonymizedTextChange}
      disabled={correctedAnonymizedDocument === ""}
    />
    <label class="flex items-center space-x-2 my-2">
      <input
        class="checkbox"
        type="checkbox"
        bind:checked={verified}
        on:click={() => (verified = !verified)}
        disabled={correctedAnonymizedDocument === ""}
      />
      <span>I have verified that the anonymization process was successful.</span>
    </label>
    <button
      class="btn variant-filled-primary"
      on:click={() => summarize(correctedAnonymizedDocument)}
      disabled={!verified}>Submit</button
    >
  {/if}
{/await}

{#await summarizedPromise}
  <LoadingBar />
{/await}
