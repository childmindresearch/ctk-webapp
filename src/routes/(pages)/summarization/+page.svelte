<script lang="ts">
    import { Upload, Paperclip, X } from "lucide-svelte"
    import mammoth from "mammoth"
    import { systemPrompt } from "./prompt"
    import { toast } from "svelte-sonner"
    import { Spinner } from "$lib/shadcn/components/ui/spinner"
    import { Button } from "$lib/shadcn/components/ui/button"
    import { Label } from "$lib/shadcn/components/ui/label"
    import * as Card from "$lib/shadcn/components/ui/card"
    import * as Alert from "$lib/shadcn/components/ui/alert"
    import {downloadBlob} from "$lib/utils"
  

    let file: File | null = $state(null)
    let loading = $state(false)
    let fileInputRef: HTMLInputElement | undefined = $state(undefined)

    async function docxToText(docx: File) {
        const buffer = await docx.arrayBuffer()
        return mammoth.extractRawText({ arrayBuffer: buffer }).then(function (result) {
            return result.value
        })
    }

    async function onSubmit(event: SubmitEvent) {
        event.preventDefault()
        if (!file) {
            toast.error("Please select a file to upload.")
            return
        }
        const text = await docxToText(file)
        const userPrompt = getTextBetween(text, /\n\s+clinical summary and impressions/i, /\n\s+recommendations/i)
        if (!userPrompt) {
            toast.error("Could not find the 'clinical summary and impressions' and 'recommendations' in the document.")
            return
        }
        let child_name = userPrompt.trim().split('\n')[2].split(' ')[0]
        fetch('/api/v1/summarization', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patient_name: child_name, text_content: userPrompt })
        })  
        .then(response => {
            if (!response.ok) throw new Error('Download failed');
            return response.blob();
        })
        .then(blob => downloadBlob(blob, 'summary.docx'))
        .catch(error => {
            console.error('Download error:', error);
            alert('Failed to download file');
        });
    }

    function getTextBetween(text: string, start: RegExp, end: RegExp) {
        const regexStart = new RegExp(start)
        const regexEnd = new RegExp(end)
        const startIndex = text.search(regexStart)
        const endIndex = text.search(regexEnd)
        if (startIndex === -1 || endIndex === -1) return null
        return text.slice(startIndex, endIndex)
    }

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files && input.files.length > 0) {
            file = input.files[0]
        }
    }

    function removeFile() {
        file = null
        if (fileInputRef) {
            fileInputRef.value = ""
        }
    }


</script>

<div class="container mx-auto max-w-2xl p-6">
    <div class="mb-8">
        <h3 class="text-2xl font-semibold mb-4">Clinical Report Summary</h3>
        <Alert.Root>
            <Alert.Description class="leading-relaxed">
                Upload a clinical report (.docx) to generate a summary. The clinical report should contain the 'clinical
                summary and impressions' and 'recommendations' sections, as we only send the paragraphs in between
                these.
            </Alert.Description>
        </Alert.Root>
    </div>

    <Card.Root>
        <Card.Content class="pt-6">
            {#if loading}
                <div class="flex flex-col items-center space-y-4 py-8">
                    <Spinner />
                    <p class="text-sm text-muted-foreground">Processing your document...</p>
                </div>
            {:else}
                <form class="space-y-6" onsubmit={onSubmit}>
                    <div class="space-y-2">
                        <Label for="file-upload">Clinical Report Document</Label>
                        <div class="space-y-4">
                            <div
                                class="relative border-2 border-dashed rounded-lg transition-colors"
                                class:border-muted-foreground={!file}
                                class:border-primary={file}
                                class:hover:border-primary={!file}
                            >
                                <input
                                    bind:this={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onchange={handleFileChange}
                                />
                                <div class="flex flex-col items-center justify-center p-8 text-center">
                                    <Upload class="w-12 h-12 mb-4 text-primary" />
                                    <p class="text-sm font-medium mb-1">
                                        {file ? "File selected" : "Click to upload or drag and drop"}
                                    </p>
                                    <p class="text-xs text-muted-foreground">Select a .docx file to upload</p>
                                </div>
                            </div>

                            {#if file}
                                <div class="flex items-center gap-2 p-3 bg-muted rounded-md">
                                    <Paperclip class="w-4 h-4 text-muted-foreground" />
                                    <span class="text-sm flex-1 truncate">{file.name}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        class="h-8 w-8"
                                        onclick={removeFile}
                                    >
                                        <X class="w-4 h-4" />
                                    </Button>
                                </div>
                            {/if}
                        </div>
                    </div>

                    <div class="bg-muted p-4 rounded-lg">
                        <h4 class="font-medium mb-2">File Requirements:</h4>
                        <ul class="text-sm text-muted-foreground space-y-1">
                            <li>• File format: Microsoft Word (.docx)</li>
                            <li>• Must contain "clinical summary and impressions" section</li>
                            <li>• Must contain "recommendations" section</li>
                            <li>• Maximum file size: 10MB</li>
                        </ul>
                    </div>

                    <div class="flex justify-start pt-4">
                        <Button type="submit" class="min-w-32" disabled={loading || !file}>
                            {#if loading}
                                Processing...
                            {:else}
                                Generate Summary
                            {/if}
                        </Button>
                    </div>
                </form>
            {/if}
        </Card.Content>
    </Card.Root>
</div>
