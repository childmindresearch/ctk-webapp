export const API_ROUTE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

export async function postMarkdownToDocx(text: string): Promise<Response | void> {
    const formData = new FormData()
    formData.append("markdown_text", text)
    return await fetch(`${API_ROUTE}/file_conversion/md2docx`, {
        method: "POST",
        body: formData
    })
        .then(async res => await res.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = "report.docx"
            link.click()
            URL.revokeObjectURL(url)
            link.remove()
        })
        .catch(error => {
            console.error("Error converting markdown to docx:", error)
        })
}
