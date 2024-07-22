import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_KEY, AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function POST({ fetch, request }) {
    logger.info("Running LanguageTool")
    const headers = new Headers({
        "x-functions-key": AZURE_FUNCTION_PYTHON_KEY || ""
    })

    const form = await request.formData()
    const text = form.get("text")
    const rules = form.get("rules")

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/language-tool/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            text: text,
            rules: rules
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
