import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"
import { StatusCode } from "$lib/utils.js"
import { postLlmRequestSchema, type PostLlmRequest } from "./index.js"

export async function POST({ fetch, request }) {
    logger.info("Making LLM request.")

    let body: PostLlmRequest | undefined = undefined
    try {
        body = postLlmRequestSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/llm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
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
