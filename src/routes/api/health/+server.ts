import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_KEY, AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function GET() {
    logger.info("Warming up the server.")
    const headers = new Headers({ "x-functions-key": AZURE_FUNCTION_PYTHON_KEY || "" })
    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/health`, { headers: headers })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            logger.error(`Error warming up the server: ${error}`)
            return new Response(error, { status: 500 })
        })
}
