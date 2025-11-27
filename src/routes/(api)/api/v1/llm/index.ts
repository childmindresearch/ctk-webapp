import { z } from "zod"
import { StatusCode } from "$lib/utils"
import type { EndpointDefinition } from "$lib/types"

export const postLlmRequestSchema = z.object({
    system_prompt: z.string(),
    user_prompt: z.string()
})

export type PostLlmRequest = z.infer<typeof postLlmRequestSchema>
export type PostLlmResponse = string

export const POST_LLM: EndpointDefinition = {
    path: "/api/v1/llm",
    pattern: () => "/api/v1/llm",
    successCodes: [StatusCode.OK]
}
