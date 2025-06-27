import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function GET({ fetch }) {
    logger.info("Warming up the server.")

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/health`)
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
