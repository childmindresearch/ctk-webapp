import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function POST({ fetch, request }) {
    logger.info("Converting markdown to docx")

    const formData = await request.formData()

    let formatting = {}
    const formattingValue = formData.get("formatting")
    if (formattingValue && typeof formattingValue === "string") {
        try {
            formatting = JSON.parse(formattingValue)
        } catch (e) {
            logger.warn("Failed to parse formatting, using default")
            formatting = {}
        }
    }

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/markdown2docx`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            markdown: formData.get("markdown"),
            formatting: formatting
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
            console.log(error)
            logger.error("Error converting markdown to docx:", error)
            return new Response(null, { status: 500 })
        })
}
