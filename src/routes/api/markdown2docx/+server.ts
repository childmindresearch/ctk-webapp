import { env } from "$env/dynamic/private"
import { logger } from "$lib/server/logging"

export async function POST({ fetch, request }) {
    logger.info("Converting markdown to docx")
    const headers = new Headers({ "x-functions-key": env.AZURE_FUNCTION_PYTHON_KEY || "" })
    return await fetch(`${env.AZURE_FUNCTION_PYTHON_URL}/markdown2docx/`, {
        method: "POST",
        headers: headers,
        body: await request.text()
    })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            logger.error("Error converting markdown to docx:", error)
            return new Response(null, { status: 500 })
        })
}
