import { z } from "zod"

const relationshipItemSchema = z.object({
    id: z.number(),
    name: z.string()
})

export const postSchemaPreset = z.object({
    name: z.string(),
    languages: z.array(relationshipItemSchema),
    areasCovered: z.array(relationshipItemSchema),
    services: z.array(relationshipItemSchema)
})

export const putSchemaPreset = postSchemaPreset
