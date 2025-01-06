import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function POST({ fetch, request }) {
    logger.info("Running LanguageTool")
    const body = await request.text()
    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/language-tool`, {
        method: "POST",
        body: body,
        headers: {
            "Content-Type": "application/json"
        }
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
