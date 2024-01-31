export const API_ROUTE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

export async function readDiagnoses(): Promise<Response> {
  return await fetch(`${API_ROUTE}/diagnoses`)
}

export async function createDiagnosis(text: string, parent_id: number | string | undefined): Promise<Response | void> {
  return await fetch(`${API_ROUTE}/diagnoses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ parent_id, diagnosis: { text } })
  }).catch(error => {
    console.error("Error creating diagnosis:", error)
  })
}

export async function patchDiagnosis(
  id: number,
  text: string | undefined,
  parent_id: number | string | undefined
): Promise<Response | void> {
  const payload = {
    ...(text && { text }),
    ...(parent_id && { parent_id })
  }
  return await fetch(`${API_ROUTE}/diagnoses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  }).catch(error => {
    console.error("Error patching diagnosis:", error)
  })
}

export async function deleteDiagnosis(id: number): Promise<Response | void> {
  return await fetch(`${API_ROUTE}/diagnoses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  }).catch(error => {
    console.error("Error deleting diagnosis:", error)
  })
}

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
    })
    .catch(error => {
      console.error("Error converting markdown to docx:", error)
    })
}
