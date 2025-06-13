import { json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { logger } from "$lib/server/logging.js"
import { provider, providerAddress, providerLocationJunction } from "$lib/server/db/schema"
import { z } from "zod"
import { zodValidateOr400, isModel } from "$lib/server/zod_utils.js"
import { getProviders } from "./fetchers.js"

export async function GET({}) {
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
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    contacts: z.array(z.string())
})

const ProviderLocationInputSchema = z.object({
    locationId: z.number()
})

const PostProviderRequestSchema = z.object({
    name: z.string(),
    addresses: z.array(ProviderAddressSchema).optional(),
    locations: z.array(ProviderLocationInputSchema).optional()
})

export async function POST({ request }) {
    const providerData = await request.json()
    let providerRequest = zodValidateOr400(PostProviderRequestSchema, providerData)
    if (!isModel(PostProviderRequestSchema, providerRequest)) {
        return providerRequest
    }

    try {
        const providerId = await db.transaction(async tx => {
            const providerIds: { id: number }[] = await tx
                .insert(provider)
                .values({
                    name: providerRequest.name
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

            if (providerRequest.locations) {
                const locations = providerRequest.locations.map(location => ({
                    ...location,
                    providerId
                }))

                const junctionEntries = locations.map(loc => ({
                    providerId: loc.providerId,
                    locationId: loc.locationId
                }))
                await tx.insert(providerLocationJunction).values(junctionEntries)
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
