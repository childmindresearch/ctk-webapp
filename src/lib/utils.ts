export function shortenText(str: string, maxLength = 200) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength) + "..."
    }
    return str
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    link.remove()
}

export const LLM_MODELS = [
    {
        name: "GPT-4o",
        tag: "gpt-4o"
    },
    {
        name: "Claude 3 Opus",
        tag: "anthropic.claude-3-opus-20240229-v1:0"
    }
]
