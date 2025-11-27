import { Endpoint, StatusCode } from "$lib/utils"
import z from "zod"

export const postTemplateDownloadSchema = z.object({
    templateIds: z.array(z.number()),
    replacements: z.record(z.string(), z.string()).default({})
})
export type PostTemplateDownloadRequest = z.infer<typeof postTemplateDownloadSchema>
export type PostTemplatesDownloadResponse = Blob

const path = () => "/api/v1/templates/download"

export const PostTemplatesDownload = new Endpoint<
    PostTemplatesDownloadResponse,
    typeof path,
    typeof postTemplateDownloadSchema
>({
    method: "POST",
    path,
    successCodes: [StatusCode.OK],
    schema: postTemplateDownloadSchema,
    responseType: "blob"
})
