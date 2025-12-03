import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"
import { getRequestEvent } from "$app/server"

export async function GET({ params, fetch }) {
    const id = params.id

    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-id", id)
    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/intake-report/${id}`)
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            logger.error(`Error getting intake with id ${id}: ${error}`)
            return new Response(error, { status: 500 })
        })
}
