import type { dsmCodes } from "$lib/server/db/schema"
import { StatusCode } from "$lib/utils"
import { z } from "zod"
import { Endpoint } from "$lib/utils"

export const putDsmRequestSchema = z.object({
    code: z.string(),
    label: z.string()
})

export type PutDsmRequest = z.infer<typeof putDsmRequestSchema>
export type PutDsmResponse = typeof dsmCodes.$inferSelect

const path = (id: string | number) => `/api/v1/dsm/${id}`
export const PutDsm = new Endpoint<PutDsmResponse, typeof path, typeof putDsmRequestSchema>({
    method: "PUT",
    path,
    successCodes: [StatusCode.OK],
    schema: putDsmRequestSchema
})
export const DeleteDsm = new Endpoint<undefined, typeof path, undefined>({
    method: "DELETE",
    path,
    successCodes: [StatusCode.NO_CONTENT]
})
