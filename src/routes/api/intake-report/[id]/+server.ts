import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_KEY, AZURE_FUNCTION_PYTHON_URL } from "$lib/server/secrets"

export async function GET({ params, fetch }) {
    const id = params.id
    logger.info("Getting intake with id ", id)
    const headers = new Headers({ "x-functions-key": AZURE_FUNCTION_PYTHON_KEY || "" })
    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/intake-report/${id}`, { headers: headers })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            console.log(error)
            logger.error(`Error getting intake with id ${id}: ${error}`)
            return new Response(error, { status: 500 })
        })
}
