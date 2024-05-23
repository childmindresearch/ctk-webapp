import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_KEY, AZURE_FUNCTION_PYTHON_URL } from "$lib/server/secrets"

export async function POST({ fetch, request }) {
    logger.info("Converting markdown to docx")
    const headers = new Headers({
        "x-functions-key": AZURE_FUNCTION_PYTHON_KEY || "",
        "X-Correct-They": request.headers.get("x-correct-they") || "",
        "X-Correct-Capitalization": request.headers.get("x-correct-capitalization") || ""
    })
    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/markdown2docx/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            markdown: await request.text()
        })
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
