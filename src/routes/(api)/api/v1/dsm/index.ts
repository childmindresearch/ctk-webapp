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

/**
 * Endpoint to retrieve all DSM codes from the database.
 * Use the .fetch() method to run the query.
 */
export const GetDsm = new Endpoint<GetDsmResponse, typeof path>({
    method: "GET",
    path: path,
    successCodes: [StatusCode.OK]
})

/**
 * Endpoint to post a new DSM code to the database.
 * Use the .fetch() method to run the query.
 */
export const PostDsm = new Endpoint<PostDsmResponse, typeof path, typeof postDsmRequestSchema>({
    method: "POST",
    path: path,
    successCodes: [StatusCode.CREATED],
    schema: postDsmRequestSchema
})
