import { db } from "$lib/server/db"
import {
    referralProviders,
    referralAddresses,
    referralSubServices,
    referralServices,
    referralProviderSubServices
} from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq, and } from "drizzle-orm"
import { z } from "zod"
import { getProviders } from "../../crud"
import { createProviderSchema } from "../schemas"

export async function GET({ params }) {
    const id = Number(params.id)
    try {
        const provider = (await getProviders([id]))[0]
        return json(provider)
    } catch (error) {
        logger.error(`Error fetching provider ${id}:`, error)
        return new Response("Could not fetch provider.", { status: 500 })
    }
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    try {
        await db.delete(referralProviders).where(eq(referralProviders.id, id))
        return new Response(null, { status: 200 })
    } catch (error) {
        logger.error(`Error deleting provider ${id}`, error)
        return new Response("Could not delete provider.", { status: 500 })
    }
}

export async function PUT({ params, request }) {
    const id = Number(params.id)
    const providerData = await request.json()

    let providerRequest: z.infer<typeof createProviderSchema>
    try {
        providerRequest = createProviderSchema.parse(providerData)
    } catch (error) {
        logger.error("Invalid provider data format", error)
        return new Response(JSON.stringify({ error: "Invalid request format", details: error }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        })
    }

    try {
        await db.transaction(async tx => {
            // Get or insert servicetype
            const serviceId = await tx
                .select()
                .from(referralServices)
                .where(eq(referralServices.name, providerRequest.service))
                .then(service => {
                    if (service.length > 0) {
                        return service[0].id
                    } else {
                        return tx
                            .insert(referralServices)
                            .values({ name: providerRequest.service })
                            .returning()
                            .then(res => res[0].id)
                    }
                })

            if (!serviceId) {
                return new Response("Service type not found or could not be created.", { status: 400 })
            }

            // Get or insert subservices
            let subServiceIds: number[] = []
            if (providerRequest.subServices && providerRequest.subServices.length > 0) {
                subServiceIds = await Promise.all(
                    providerRequest.subServices.map(async name => {
                        const subService = await tx
                            .select()
                            .from(referralSubServices)
                            .where(
                                and(eq(referralSubServices.name, name), eq(referralSubServices.serviceId, serviceId))
                            )
                        if (subService.length > 0) {
                            return subService[0].id
                        } else {
                            const newSubService = await tx
                                .insert(referralSubServices)
                                .values({ name: name, serviceId: serviceId })
                                .returning()
                            return newSubService[0].id
                        }
                    })
                )
            }

            // Replace provider details.
            await tx
                .update(referralProviders)
                .set({
                    name: providerRequest.name,
                    acceptsInsurance: providerRequest.acceptsInsurance,
                    insuranceDetails: providerRequest.insuranceDetails,
                    minAge: providerRequest.minAge,
                    maxAge: providerRequest.maxAge,
                    serviceId: serviceId,
                    notes: providerRequest.notes
                })
                .where(eq(referralProviders.id, id))

            // Replace subservices.
            await tx.delete(referralProviderSubServices).where(eq(referralProviderSubServices.providerId, id))
            await Promise.all(
                subServiceIds.map(subServiceId =>
                    tx
                        .insert(referralProviderSubServices)
                        .values({ providerId: id, subServiceId: subServiceId })
                        .onConflictDoNothing()
                )
            )

            // Replace addresses.
            await tx.delete(referralAddresses).where(eq(referralAddresses.providerId, id))
            if (providerRequest.addresses && providerRequest.addresses.length > 0) {
                const addresses = providerRequest.addresses.map(address => ({
                    ...address,
                    providerId: id
                }))
                await tx.insert(referralAddresses).values(addresses)
            }
        })

        const updatedProvider = (await getProviders([id]))[0]
        return json(updatedProvider)
    } catch (error) {
        logger.error(`Error updating provider ${id}:`, error)
        return new Response(JSON.stringify({ error: "Failed to update provider" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
