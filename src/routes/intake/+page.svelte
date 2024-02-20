<script lang="ts">
  import { FileDropzone, getToastStore } from "@skeletonlabs/skeleton"
  import { API_ROUTE } from "$lib/api"

  let firstName = ""
  let lastName = ""
  let files: FileList

  const toastStore = getToastStore()

  function onSubmit() {
    if (!firstName || !lastName || !files.length) {
      toastStore.trigger({
        background: "variant-filled-error",
        message: "Please fill out all fields."
      })
      return
    }

    const formData = new FormData()
    formData.append("csv_file", files[0])
    formData.append("first_name", firstName)
    formData.append("last_name", lastName)

    fetch(`${API_ROUTE}/file_conversion/intake2docx`, {
      method: "POST",
      body: formData
    })
      .then(async res => await res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "intake.docx"
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        link.remove()
      })
      .catch(() => {
        toastStore.trigger({
          background: "variant-filled-error",
          message: "Error submitting intake."
        })
      })
  }
</script>

{#if files}
  <p>File: {files[0].name}</p>
{:else}
  <FileDropzone name="file" multiple={false} accept=".csv" bind:files>
    <svelte:fragment slot="message">Drop the intake .csv file here.</svelte:fragment>
  </FileDropzone>
{/if}

<input class="input" type="text" placeholder="First Name" bind:value={firstName} />
<input class="input" type="text" placeholder="Last Name" bind:value={lastName} />

<button class="btn variant-filled-primary" on:click={onSubmit}> Submit </button>
