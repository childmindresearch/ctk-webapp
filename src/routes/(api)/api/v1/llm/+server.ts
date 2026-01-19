import { ctkFunctionsClient } from "$lib/server/ctk_functions/index.js"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils.js"
import { postLlmRequestSchema, type PostLlmRequest } from "./index.js"

export async function POST({ request }) {
    logger.info("Making LLM request.")

    let body: PostLlmRequest | undefined = undefined
    try {
        body = postLlmRequestSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }

    const { data, error } = await ctkFunctionsClient.POST("/llm", {
        headers: {
            "Content-Type": "application/json"
        },
        body
    })

    if (error === undefined) {
        return new Response(data)
    }
    return new Response("Could not call the LLM", { status: StatusCode.INTERNAL_SERVER_ERROR })
}
