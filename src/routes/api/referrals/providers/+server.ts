import { json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { logger } from "$lib/server/logging.js"
import { provider, providerAddress } from "$lib/server/db/schema"
import { z } from "zod"
import { zodValidateOr400, isModel } from "$lib/server/zod_utils.js"
import { getProviders } from "./fetchers.js"

export async function GET() {
    logger.info("Getting all providers.")
    try {
        return json({
            providers: await getProviders()
        })
    } catch (error) {
        logger.error("Error fetching providers:", error)
        return new Response("Could not fetch providers.", { status: 500 })
    }
}

const ProviderAddressSchema = z.object({
    addressId: z.number().optional(),
    providerId: z.number().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    location: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    contacts: z.array(z.string()),
    isRemote: z.boolean()
})

const PostProviderRequestSchema = z.object({
    name: z.string(),
    addresses: z.array(ProviderAddressSchema),
    acceptsInsurance: z.boolean(),
    insuranceDetails: z.string(),
    minAge: z.number(),
    maxAge: z.number()
})

export async function POST({ request }) {
    const providerData = await request.json()
    const providerRequest = zodValidateOr400(PostProviderRequestSchema, providerData)
    if (!isModel(PostProviderRequestSchema, providerRequest)) {
        return providerRequest
    }

    try {
        const providerId = await db.transaction(async tx => {
            const providerIds: { id: number }[] = await tx
                .insert(provider)
                .values({
                    name: providerRequest.name,
                    acceptsInsurance: providerRequest.acceptsInsurance,
                    insuranceDetails: providerRequest.insuranceDetails,
                    minAge: providerRequest.minAge,
                    maxAge: providerRequest.maxAge
                })
                .returning({ id: provider.id })
            const providerId = providerIds[0].id

            if (providerRequest.addresses) {
                const addresses = providerRequest.addresses.map(address => ({
                    ...address,
                    providerId
                }))
                await tx.insert(providerAddress).values(addresses)
            }

            return providerId
        })

        const newProvider = (await getProviders(providerId))[0]
        return json(newProvider, { status: 201 })
    } catch (error) {
        console.error("Error creating provider:", error)
        return new Response(JSON.stringify({ error: "Failed to create provider" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
