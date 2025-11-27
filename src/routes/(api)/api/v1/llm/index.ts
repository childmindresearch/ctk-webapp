import { z } from "zod"
import { Endpoint, StatusCode } from "$lib/utils"

export const postLlmRequestSchema = z.object({
    system_prompt: z.string(),
    user_prompt: z.string()
})

export type PostLlmRequest = z.infer<typeof postLlmRequestSchema>
export type PostLlmResponse = string

const path = () => "/api/v1/llm"
export const PostLlm = new Endpoint<PostLlmResponse, typeof path, typeof postLlmRequestSchema>({
    method: "POST",
    path,
    successCodes: [StatusCode.OK],
    schema: postLlmRequestSchema
})
