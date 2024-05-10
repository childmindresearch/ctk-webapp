import { env } from "$env/dynamic/private"
import { logger } from "$lib/server/logging"

export async function POST({ fetch, request }) {
    logger.info("Making LLM request.")
    const headers = new Headers({
        "x-functions-key": env.AZURE_FUNCTION_PYTHON_KEY || ""
    })
    const formData = await request.formData()
    const body = JSON.stringify({
        systemPrompt: formData.get("systemPrompt"),
        userPrompt: formData.get("userPrompt")
    })

    return await fetch(`${env.AZURE_FUNCTION_PYTHON_URL}/llm/`, {
        method: "POST",
        headers: headers,
        body
    })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            logger.error("Error getting LLM response:", error)
            return new Response(null, { status: 500 })
        })
}
