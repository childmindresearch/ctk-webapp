import z from "zod"

export const ReferralTable = z.object({
    // Note: Capitalization of properties is intentional; property names are the table headers.
    Name: z.array(z.string()),
    Addresses: z.array(z.string()),
    Insurance: z.array(z.string()),
    Notes: z.array(z.string())
})

export const PostReferralSchema = z.object({
    title: z.string(),
    tables: z.array(
        z.object({
            title: z.string(),
            table: ReferralTable
        })
    )
})
