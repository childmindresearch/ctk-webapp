import { Endpoint, StatusCode } from "$lib/utils"
import { z } from "zod"
import type { templates } from "$lib/server/db/schema"

export const postTemplateSchema = z.object({
    text: z.string()
})

export const putTemplateSchema = z.object({
    text: z.string(),
    parentId: z.number().nullable(),
    priority: z.number()
})

export type PostTemplateRequest = z.infer<typeof postTemplateSchema>
export type PostTemplateResponse = typeof templates.$inferSelect

export type PutTemplateRequest = z.infer<typeof putTemplateSchema>
export type PutTemplateResponse = typeof templates.$inferSelect

const path = (id: string | number) => `/api/v1/templates/${id}`

export const PostTemplate = new Endpoint<PostTemplateResponse, typeof path, typeof postTemplateSchema>({
    method: "POST",
    path,
    successCodes: [StatusCode.CREATED],
    schema: postTemplateSchema
})

export const PutTemplate = new Endpoint<PutTemplateResponse, typeof path, typeof putTemplateSchema>({
    method: "PUT",
    path,
    successCodes: [StatusCode.OK],
    schema: putTemplateSchema
})

export const DeleteTemplate = new Endpoint<undefined, typeof path>({
    method: "DELETE",
    path,
    successCodes: [StatusCode.NO_CONTENT]
})
