import { db } from "$lib/server/db"
import { provider, providerAddress, providerSubServices, serviceType, subServiceType } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { isModel, zodValidateOr400 } from "$lib/server/zod_utils.js"
import { json } from "@sveltejs/kit"
import { eq, and } from "drizzle-orm"
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
    addressId: z.number().nullable().optional(),
    providerId: z.number().nullable().optional(),
    addressLine1: z.string().nullable().optional(),
    addressLine2: z.string().nullable().optional(),
    isRemote: z.boolean(),
    location: z.string(),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    zipCode: z.string().nullable().optional(),
    contacts: z.array(z.string()).nullable().optional()
})

const PutProviderRequestSchema = z.object({
    name: z.string(),
    addresses: z.array(ProviderAddressSchema).nullable().optional(),
    acceptsInsurance: z.boolean(),
    insuranceDetails: z.string().nullable().optional(),
    minAge: z.number(),
    maxAge: z.number(),
    serviceType: z.string(),
    subServices: z.array(z.string()).nullable().optional()
})

export async function PUT({ params, request }) {
    const id = Number(params.id)
    const providerData = await request.json()

    const providerRequest = zodValidateOr400(PutProviderRequestSchema, providerData)
    if (!isModel(PutProviderRequestSchema, providerRequest)) {
        return providerRequest
    }

    try {
        await db.transaction(async tx => {
            // Get or insert servicetype
            const serviceTypeId = await tx
                .select()
                .from(serviceType)
                .where(eq(serviceType.name, providerRequest.serviceType))
                .then(service => {
                    if (service.length > 0) {
                        return service[0].id
                    } else {
                        return tx
                            .insert(serviceType)
                            .values({ name: providerRequest.serviceType })
                            .returning()
                            .then(res => res[0].id)
                    }
                })

            if (!serviceTypeId) {
                return new Response("Service type not found or could not be created.", { status: 400 })
            }

            // Get or insert subservices
            let subServiceIds: number[] = []
            if (providerRequest.subServices && providerRequest.subServices.length > 0) {
                subServiceIds = await Promise.all(
                    providerRequest.subServices.map(async name => {
                        const subService = await tx
                            .select()
                            .from(subServiceType)
                            .where(and(eq(subServiceType.name, name), eq(subServiceType.serviceTypeId, serviceTypeId)))
                        if (subService.length > 0) {
                            return subService[0].id
                        } else {
                            const newSubService = await tx
                                .insert(subServiceType)
                                .values({ name: name, serviceTypeId: serviceTypeId })
                                .returning()
                            return newSubService[0].id
                        }
                    })
                )
            }

            // Replace provider details.
            await tx
                .update(provider)
                .set({
                    name: providerRequest.name,
                    acceptsInsurance: providerRequest.acceptsInsurance,
                    insuranceDetails: providerRequest.insuranceDetails,
                    minAge: providerRequest.minAge,
                    maxAge: providerRequest.maxAge,
                    serviceTypeId: serviceTypeId
                })
                .where(eq(provider.id, id))

            // Replace subservices.
            await tx.delete(providerSubServices).where(eq(providerSubServices.providerId, id))
            await Promise.all(
                subServiceIds.map(subServiceId =>
                    tx
                        .insert(providerSubServices)
                        .values({ providerId: id, subServiceTypeId: subServiceId })
                        .onConflictDoNothing()
                )
            )

            // Replace addresses.
            await tx.delete(providerAddress).where(eq(providerAddress.providerId, id))
            if (providerRequest.addresses && providerRequest.addresses.length > 0) {
                const addresses = providerRequest.addresses.map(address => ({
                    ...address,
                    providerId: id
                }))
                await tx.insert(providerAddress).values(addresses)
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
