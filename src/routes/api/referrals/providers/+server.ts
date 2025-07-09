import { json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { logger } from "$lib/server/logging.js"
import {
    referralProviders,
    referralAddresses,
    referralSubServices,
    referralServices,
    referralProviderSubServices
} from "$lib/server/db/schema"
import { z } from "zod"
import { zodValidateOr400, isModel } from "$lib/server/zod_utils.js"
import { getProviders } from "../fetchers.js"
import { eq, and } from "drizzle-orm"

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
    addressId: z.number().nullable().optional(),
    providerId: z.number().nullable().optional(),
    addressLine1: z.string().nullable().optional(),
    addressLine2: z.string().nullable().optional(),
    location: z.string(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    zipCode: z.string().nullable().optional(),
    contacts: z.array(z.string()),
    isRemote: z.boolean()
})

const PostProviderRequestSchema = z.object({
    name: z.string(),
    addresses: z.array(ProviderAddressSchema),
    acceptsInsurance: z.boolean(),
    insuranceDetails: z.string(),
    minAge: z.number(),
    maxAge: z.number(),
    serviceType: z.string(),
    subServices: z.array(z.string())
})

export async function POST({ request }) {
    const providerData = await request.json()
    const providerRequest = zodValidateOr400(PostProviderRequestSchema, providerData)
    if (!isModel(PostProviderRequestSchema, providerRequest)) {
        return providerRequest
    }

    try {
        const providerId = await db.transaction(async tx => {
            let service = await tx
                .select()
                .from(referralServices)
                .where(eq(referralServices.name, providerRequest.serviceType))
            if (service.length == 0) {
                service = await tx.insert(referralServices).values({ name: providerRequest.serviceType }).returning()
            }
            const serviceId = service[0].id

            const subServices = await Promise.all(
                providerRequest.subServices.map(async name => {
                    let subService = await tx
                        .select()
                        .from(referralSubServices)
                        .where(and(eq(referralSubServices.name, name), eq(referralSubServices.serviceId, serviceId)))
                    if (subService.length == 0) {
                        subService = await tx
                            .insert(referralSubServices)
                            .values({ name: name, serviceId: serviceId })
                            .returning()
                    }
                    return subService[0]
                })
            )

            const providerIds: { id: number }[] = await tx
                .insert(referralProviders)
                .values({
                    name: providerRequest.name,
                    acceptsInsurance: providerRequest.acceptsInsurance,
                    insuranceDetails: providerRequest.insuranceDetails,
                    minAge: providerRequest.minAge,
                    maxAge: providerRequest.maxAge,
                    serviceId: serviceId
                })
                .returning({ id: referralProviders.id })
            const providerId = providerIds[0].id

            if (providerRequest.addresses) {
                const addresses = providerRequest.addresses.map(address => ({
                    ...address,
                    providerId
                }))
                await tx.insert(referralAddresses).values(addresses)
            }

            await Promise.all(
                subServices.map(subService => {
                    tx.insert(referralProviderSubServices).values({ providerId, subServiceId: subService.id })
                })
            )
            return providerId
        })

        const newProvider = (await getProviders(providerId))[0]
        console.log(newProvider)
        return json(newProvider, { status: 201 })
    } catch (error) {
        console.error("Error creating provider:", error)
        return new Response(JSON.stringify({ error: "Failed to create provider" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
