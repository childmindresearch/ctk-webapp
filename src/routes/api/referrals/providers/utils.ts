import {
    providersToAreasCovered,
    providersToLanguages,
    providersToServices,
    referralAreaCovered,
    referralLanguages,
    referralServices
} from "$lib/server/db/schema"
import { z } from "zod"

const relationshipItemSchema = z.object({
    id: z.number(),
    name: z.string()
})

export const postSchema = z.object({
    name: z.string(),
    address: z.string(),
    phone: z.string(),
    website: z.string(),
    takesInsurance: z.boolean(),
    description: z.string(),
    languages: z.array(relationshipItemSchema),
    areasCovered: z.array(relationshipItemSchema),
    services: z.array(relationshipItemSchema)
})

export const putSchema = postSchema

export const relationships: {
    junctionTable: any
    mainTable: any
    bodyName: "languages" | "areasCovered" | "services"
}[] = [
    {
        junctionTable: providersToLanguages,
        mainTable: referralLanguages,
        bodyName: "languages"
    },
    {
        junctionTable: providersToServices,
        mainTable: referralServices,
        bodyName: "services"
    },
    {
        junctionTable: providersToAreasCovered,
        mainTable: referralAreaCovered,
        bodyName: "areasCovered"
    }
]
