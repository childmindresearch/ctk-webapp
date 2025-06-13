import { db } from "$lib/server/db"
import { provider, providerAddress, providerLocationJunction } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { isModel, zodValidateOr400 } from "$lib/server/zod_utils.js"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getProviders } from "../fetchers"

export async function GET({ params }) {
    const id = Number(params.id)
    try {
        const provider = (await getProviders(id))[0]
        return json(provider)
    } catch (error) {
        logger.error(`Error fetching provider ${id}:`, error)
        return new Response("Could not fetch provider.", { status: 500 })
    }
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    try {
        await db.delete(provider).where(eq(provider.id, id))
        return new Response(null, { status: 200 })
    } catch (error) {
        logger.error(`Error deleting provider ${id}`, error)
        return new Response("Could not delete provider.", { status: 500 })
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
    contacts: z.array(z.string()).optional()
})

const ProviderLocationInputSchema = z.object({
    locationId: z.number()
})

const PutProviderRequestSchema = z.object({
    name: z.string(),
    addresses: z.array(ProviderAddressSchema).optional(),
    locations: z.array(ProviderLocationInputSchema).optional()
})

export async function PUT({ params, request }) {
    const id = Number(params.id)
    const providerData = await request.json()

    let providerRequest = zodValidateOr400(PutProviderRequestSchema, providerData)
    if (!isModel(PutProviderRequestSchema, providerRequest)) {
        return providerRequest
    }

    logger.info("PUT!")
    logger.info(providerRequest)
    try {
        await db.transaction(async tx => {
            await tx
                .update(provider)
                .set({
                    name: providerRequest.name
                })
                .where(eq(provider.id, id))

            await tx.delete(providerAddress).where(eq(providerAddress.providerId, id))
            if (providerRequest.addresses && providerRequest.addresses.length > 0) {
                const addresses = providerRequest.addresses.map(address => ({
                    ...address,
                    providerId: id
                }))
                await tx.insert(providerAddress).values(addresses)
            }

            await tx.delete(providerLocationJunction).where(eq(providerLocationJunction.providerId, id))
            if (providerRequest.locations && providerRequest.locations.length > 0) {
                const junctionEntries = providerRequest.locations.map(location => ({
                    providerId: id,
                    locationId: location.locationId
                }))
                await tx.insert(providerLocationJunction).values(junctionEntries)
            }
        })

        const updatedProvider = (await getProviders(id))[0]
        return json(updatedProvider)
    } catch (error) {
        logger.error(`Error updating provider ${id}:`, error)
        return new Response(JSON.stringify({ error: "Failed to update provider" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
