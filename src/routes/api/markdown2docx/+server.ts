import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_KEY, AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function POST({ fetch, request }) {
    logger.info("Converting markdown to docx")
    const headers = new Headers({
        "x-functions-key": AZURE_FUNCTION_PYTHON_KEY || ""
    })

    const formData = await request.formData()
    const markdown = formData.get("markdown")
    if (!markdown) {
        return new Response(null, { status: 400 })
    }
    const formatting = formData.get("formatting") || null
    const body = JSON.stringify({
        markdown,
        formatting
    })

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/markdown2docx/`, {
        method: "POST",
        headers: headers,
        body: body
    })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            console.log(error)
            logger.error("Error converting markdown to docx:", error)
            return new Response(null, { status: 500 })
        })
}
