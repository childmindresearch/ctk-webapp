import { z } from "zod"
import { Endpoint, StatusCode } from "$lib/utils"

export const postLlmRequestSchema = z.object({
    system_prompt: z.string(),
    user_prompt: z.string()
})

export type PostLlmRequest = z.infer<typeof postLlmRequestSchema>
export type PostLlmResponse = string

const path = () => "/api/v1/llm"
/**
 * Endpoint to generate a response from the LLM using a system and user prompt.
 * Use the .fetch() method to run the query.
 */
export const PostLlm = new Endpoint<PostLlmResponse, typeof path, typeof postLlmRequestSchema>({
    method: "POST",
    path,
    successCodes: [StatusCode.OK],
    schema: postLlmRequestSchema
})
