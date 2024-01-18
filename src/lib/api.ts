export const API_ROUTE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

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
  return await fetch(`${API_ROUTE}/diagnoses/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ body: { text, parent_id } })
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
