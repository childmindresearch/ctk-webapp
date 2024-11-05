<script lang="ts">
    import mammoth from "mammoth"
    import { systemPrompt } from "./prompt"
    import { getToastStore, type ToastSettings } from "@skeletonlabs/skeleton"
    import LoadingBar from "$lib/components/LoadingBar.svelte"

    let file: FileList
    let loading = false

    const model = "anthropic.claude-3-5-sonnet-20241022-v2:0"
    const toastStore = getToastStore()

    async function docxToText(docx: File) {
        const buffer = await docx.arrayBuffer()
        return mammoth.extractRawText({ arrayBuffer: buffer }).then(function (result) {
            return result.value
        })
    }

    async function onSubmit(event: SubmitEvent) {
        event.preventDefault()
        if (file.length === 0) {
            const toast = {
                message: "Please select a file to upload.",
                background: "variant-filled-error"
            }
            toastStore.trigger(toast)
            return
        }
        const text = await docxToText(file[0])
        const userPrompt = getTextBetween(text, /\n\s+clinical summary and impressions/i, /\n\s+recommendations/i)
        if (!userPrompt) {
            const toast = {
                message: "Could not find the 'clinical summary and impressions' and 'recommendations' in the document.",
                background: "variant-filled-error"
            }
            toastStore.trigger(toast)
            return
        }

        const form = new FormData()
        form.append("userPrompt", userPrompt)
        form.append("systemPrompt", systemPrompt)
        form.append("model", model)

        loading = true
        const response = await fetch("/api/llm", {
            method: "POST",
            body: form
        })
            .then(async response => {
                if (response.ok) {
                    return await response.text()
                }
                const toast: ToastSettings = {
                    message: "There was a problem connecting to the server.",
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                return
            })
            .catch(error => {
                const toast: ToastSettings = {
                    message: `There was a interpreting the server response: ${error}.`,
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                loading = false
                return
            })
        if (!response) {
            loading = false
            return
        }
        let markdown2docxForm = new FormData()
        markdown2docxForm.append("markdown", response)
        return await fetch("/api/markdown2docx", {
            method: "POST",
            body: markdown2docxForm
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
                const toast: ToastSettings = {
                    message: "There was a problem connecting to the server.",
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
                loading = false
                return
            })
            .catch(error => {
                const toast: ToastSettings = {
                    message: `There was a interpreting the server response: ${error}.`,
                    background: "variant-filled-error"
                }
                toastStore.trigger(toast)
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

Upload a clinical report to generate a summary. The clinical report should contain the 'clinical summary and
impressions' and 'recommendations' sections, as we only send the paragraphs in between these.
<form class="space-y-2" on:submit={onSubmit}>
    <input type="file" accept=".docx" bind:files={file} />
    <button type="submit" class="btn variant-filled-primary">Submit</button>
</form>

<LoadingBar hidden={!loading} />
