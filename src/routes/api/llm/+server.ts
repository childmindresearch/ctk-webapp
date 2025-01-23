import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function POST({ fetch, request }) {
    logger.info("Making LLM request.")
    const formData = await request.formData()

    const systemPrompt = formData.get("systemPrompt")
    const userPrompt = formData.get("userPrompt")
    const model = formData.get("model") || "gpt-4o"

    if (!systemPrompt || !userPrompt) {
        return new Response("System or user prompt not found.", { status: 400 })
    }
    const body = JSON.stringify({ system_prompt: systemPrompt, user_prompt: userPrompt, model: model })

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/llm`, {
        method: "POST",
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
