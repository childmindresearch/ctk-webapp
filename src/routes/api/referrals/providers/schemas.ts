import { z } from "zod"

const relationshipItemSchema = z.object({
    id: z.number(),
    name: z.string()
})

export const postSchemaProvider = z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    website: z.string(),
    takesInsurance: z.boolean(),
    description: z.string(),
    languages: z.array(relationshipItemSchema),
    services: z.array(relationshipItemSchema)
})

export const putSchemaProvider = postSchemaProvider
