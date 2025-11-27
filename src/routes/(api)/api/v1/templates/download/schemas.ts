import z from "zod"

export const TemplatesDownloadPOSTSchema = z.object({
    templateIds: z.array(z.number()),
    replacements: z.record(z.string(), z.string()).default({})
})
