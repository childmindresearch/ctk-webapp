import { z } from "zod"
import { Endpoint, StatusCode } from "$lib/utils"
import type { dsmCodes } from "$lib/server/db/schema"

export * from "./[id]"

export const postDsmRequestSchema = z.object({
    code: z.string(),
    label: z.string()
})

export type GetDsmResponse = (typeof dsmCodes.$inferSelect)[]
export type PostDsmResponse = typeof dsmCodes.$inferSelect

export type PostDsmRequest = z.infer<typeof postDsmRequestSchema>

const path = () => "/api/v1/dsm"
export const GetDsm = new Endpoint<GetDsmResponse, typeof path>(path, [StatusCode.OK])
export const PostDsm = new Endpoint<PostDsmResponse, typeof path, typeof postDsmRequestSchema>(
    path,
    [StatusCode.CREATED],
    postDsmRequestSchema
)
