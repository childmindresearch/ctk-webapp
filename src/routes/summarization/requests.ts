import { API_ROUTE } from "$lib/api"
import { anonymizedReport } from "$lib/store"

export async function handleAnonymization() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".docx"
  input.multiple = false
  input.onchange = async () => {
    if (!input.files) return
    const file = input.files[0]
    const formData = new FormData()
    formData.append("docx_file", file)
    anonymizedReport.set(
      fetch(`${API_ROUTE}/summarization/anonymize_report`, {
        method: "POST",
        body: formData
      }).then(async res => await res.text())
    )
  }
  input.click()
}

export async function handleSummarization(anonymizedDocument: string): Promise<void> {
  const response = await fetch(`${API_ROUTE}/summarization/summarize_report`, {
    method: "POST",
    body: JSON.stringify({ text: anonymizedDocument }),
    headers: { "Content-Type": "application/json" }
  })

  if (response.ok) {
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "summarized_report.docx"
    link.click()

    URL.revokeObjectURL(url)
  } else {
    throw new Error("Failed to fetch summarized report")
  }
}
