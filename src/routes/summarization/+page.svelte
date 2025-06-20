<script lang="ts">
    import { FileUpload } from "@skeletonlabs/skeleton-svelte"
    import FileUploadIcon from "$lib/icons/FileUploadIcon.svelte"
    import PaperclipIcon from "$lib/icons/PaperclipIcon.svelte"

    import mammoth from "mammoth"
    import { systemPrompt } from "./prompt"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { toaster } from "$lib/utils"
    import XIcon from "$lib/icons/XIcon.svelte"

    let file: File[] = $state([])
    let loading = $state(false)

    async function docxToText(docx: File) {
        const buffer = await docx.arrayBuffer()
        return mammoth.extractRawText({ arrayBuffer: buffer }).then(function (result) {
            return result.value
        })
    }

    async function onSubmit(event: SubmitEvent) {
        event.preventDefault()
        if (file.length === 0) {
            toaster.error({ title: "Please select a file to upload." })
            return
        }
        const text = await docxToText(file[0])
        const userPrompt = getTextBetween(text, /\n\s+clinical summary and impressions/i, /\n\s+recommendations/i)
        if (!userPrompt) {
            toaster.error({
                title: "Could not find the 'clinical summary and impressions' and 'recommendations' in the document."
            })
            return
        }

        const form = new FormData()
        form.append("userPrompt", userPrompt)
        form.append("systemPrompt", systemPrompt)

        loading = true
        const response = await fetch("/api/llm", {
            method: "POST",
            body: form
        })
            .then(async response => {
                if (response.ok) {
                    return await response.json()
                }
                toaster.error({ title: "There was a problem connecting to the server." })
                return
            })
            .catch(error => {
                toaster.error({ title: `The was a problem interpreting the server response: ${error}` })
                loading = false
                return
            })
        if (!response) {
            loading = false
            return
        }

        const formData = new FormData()
        formData.append("markdown", response)
        formData.append("formatting", JSON.stringify({}))

        return await fetch("/api/markdown2docx", {
            method: "POST",
            body: formData
        })
            .then(async response => {
                if (response.ok) {
                    const blob = await response.blob()
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = "summary.docx"
                    a.click()
                    URL.revokeObjectURL(url)
                    loading = false
                    return
                }
                toaster.error({ title: "There was a problem connecting to the server." })
                loading = false
                return
            })
            .catch(error => {
                toaster.error({
                    title: `There was a problem interpreting the server response: ${error}.`
                })
                loading = false
                return
            })
    }

    function getTextBetween(text: string, start: RegExp, end: RegExp) {
        const regexStart = new RegExp(start)
        const regexEnd = new RegExp(end)
        const startIndex = text.search(regexStart)
        const endIndex = text.search(regexEnd)
        if (startIndex === -1 || endIndex === -1) return null
        return text.slice(startIndex, endIndex)
    }
</script>

Upload a clinical report (.docx) to generate a summary. The clinical report should contain the 'clinical summary and
impressions' and 'recommendations' sections, as we only send the paragraphs in between these.
<form class="space-y-2" onsubmit={onSubmit}>
    <FileUpload
        name="Upload Clinical Report"
        accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        maxFiles={1}
        subtext="Attach a file."
        onFileChange={e => (file = e.acceptedFiles)}
        classes="w-full"
    >
        {#snippet iconInterface()}<FileUploadIcon class="size-8" />{/snippet}
        {#snippet iconFile()}<PaperclipIcon class="size-4" />{/snippet}
        {#snippet iconFileRemove()}<XIcon class="size-4" />{/snippet}
    </FileUpload>
    <button type="submit" class="btn preset-filled-primary-500">Submit</button>
</form>

<LoadingBar hidden={!loading} />
