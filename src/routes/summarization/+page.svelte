<script lang="ts">
    import { FileUpload } from "@skeletonlabs/skeleton-svelte"
    import { Upload, Paperclip, X } from "@lucide/svelte"

    import mammoth from "mammoth"
    import { systemPrompt } from "./prompt"
    import LoadingBar from "$lib/components/LoadingBar.svelte"
    import { toaster } from "$lib/utils"

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

<div class="container mx-auto max-w-2xl p-6">
    <!-- Header Section -->
    <div class="mb-8">
        <h3 class="h3 mb-4">Clinical Report Summary</h3>
        <div class="bg-surface-100 dark:bg-surface-700 p-4 rounded-lg border-l-4 border-primary-500">
            <p class="text-surface-700 dark:text-surface-200 leading-relaxed">
                Upload a clinical report (.docx) to generate a summary. The clinical report should contain the
                <strong>'clinical summary and impressions'</strong> and <strong>'recommendations'</strong> sections, as we
                only send the paragraphs in between these.
            </p>
        </div>
    </div>

    <!-- Content Section -->
    <div class="card p-6 bg-surface-50 dark:bg-surface-800 shadow-lg">
        {#if loading}
            <div class="flex flex-col items-center space-y-4">
                <LoadingBar label="Processing clinical report... This may take a while." />
            </div>
        {:else}
            <form class="space-y-6" onsubmit={onSubmit}>
                <div class="form-group">
                    <span class="label-text font-medium text-surface-800 dark:text-surface-200">
                        Clinical Report Document
                    </span>

                    <FileUpload
                        name="Upload Clinical Report"
                        accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        maxFiles={1}
                        subtext="Select a .docx file to upload"
                        onFileChange={e => (file = e.acceptedFiles)}
                        classes="w-full border-2 border-dashed border-surface-300 dark:border-surface-600 hover:border-primary-400 transition-colors"
                    >
                        {#snippet iconInterface()}<Upload class="size-8 text-primary-500" />{/snippet}
                        {#snippet iconFile()}<Paperclip class="size-4" />{/snippet}
                        {#snippet iconFileRemove()}<X class="size-4" />{/snippet}
                    </FileUpload>
                </div>

                <!-- File Requirements Info -->
                <div class="bg-surface-200 dark:bg-surface-600 p-3 rounded-lg">
                    <h4 class="font-medium text-surface-800 dark:text-surface-200 mb-2">File Requirements:</h4>
                    <ul class="text-sm text-surface-800 dark:text-surface-300 space-y-1">
                        <li>• File format: Microsoft Word (.docx)</li>
                        <li>• Must contain "clinical summary and impressions" section</li>
                        <li>• Must contain "recommendations" section</li>
                        <li>• Maximum file size: 10MB</li>
                    </ul>
                </div>

                <div class="flex justify-start pt-4">
                    <button
                        type="submit"
                        class="btn preset-filled-primary-500 min-w-32"
                        disabled={loading || !file?.length}
                    >
                        {#if loading}
                            Processing...
                        {:else}
                            Generate Summary
                        {/if}
                    </button>
                </div>
            </form>
        {/if}
    </div>
</div>
