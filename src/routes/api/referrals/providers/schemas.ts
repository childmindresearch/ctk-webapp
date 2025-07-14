import { z } from "zod"

const createAddressSchema = z.object({
    location: z.string().min(1, "Location is required"),
    isRemote: z.boolean(),
    addressLine1: z.string().nullable().optional(),
    addressLine2: z.string().nullable().optional(),
    city: z.string().max(100).nullable().optional(),
    state: z.string().max(50).nullable().optional(),
    zip_code: z.string().max(20).nullable().optional(),
    contacts: z.array(z.string()).default([])
})

export const createProviderSchema = z
    .object({
        name: z.string().min(1, "Provider name is required").max(500, "Provider name too long"),
        acceptsInsurance: z.boolean(),
        insuranceDetails: z.string().max(1024),
        minAge: z.number().int().min(0).max(150).default(0),
        maxAge: z.number().int().min(0).max(150).default(120),
        service: z.string().min(1, "Service is required"),
        subServices: z.array(z.string()).default([]),
        addresses: z.array(createAddressSchema).min(1, "At least one address is required")
    })
    .refine(
        data => {
            if (data.minAge !== null && data.maxAge !== null) {
                return data.minAge <= data.maxAge
            }
            return true
        },
        {
            message: "Minimum age must be less than or equal to maximum age",
            path: ["min_age"]
        }
    )
