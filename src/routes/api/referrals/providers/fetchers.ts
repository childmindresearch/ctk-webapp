import { db } from "$lib/server/db"
import { provider, providerLocation, providerLocationJunction, providerAddress } from "$lib/server/db/schema.js"
import type { GetProviderResponse } from "$lib/types"
import { eq, inArray } from "drizzle-orm"

export async function getProviders(ids: number | number[] | undefined = undefined): Promise<GetProviderResponse> {
    let providers
    if (ids === undefined) {
        providers = await db.select().from(provider)
    } else {
        ids = Array.isArray(ids) ? ids : [ids]
        providers = await db.select().from(provider).where(inArray(provider.id, ids))
    }

    const [locations, addresses] = await Promise.all([
        db
            .select({
                providerId: providerLocationJunction.providerId,
                id: providerLocation.id,
                name: providerLocation.name
            })
            .from(providerLocation)
            .leftJoin(providerLocationJunction, eq(providerLocationJunction.locationId, providerLocation.id)),
        db
            .select({
                providerId: providerAddress.providerId,
                id: providerAddress.id,
                addressLine1: providerAddress.addressLine1,
                addressLine2: providerAddress.addressLine2,
                city: providerAddress.city,
                state: providerAddress.state,
                zipCode: providerAddress.zipCode,
                contacts: providerAddress.contacts
            })
            .from(providerAddress)
    ])

    const locationsNoNull = locations.filter(loc => loc.providerId !== null) as {
        providerId: number
        id: number
        name: string
    }[]
    const groupedLocations = groupById(locationsNoNull, "providerId")
    const groupedAddresses = groupById(addresses, "providerId")

    const providersWithRelations: GetProviderResponse = providers.map(providerData => {
        const providerId = providerData.id
        return {
            ...providerData,
            locations: groupedLocations[providerId] || [],
            addresses: groupedAddresses[providerId] || []
        }
    })

    return providersWithRelations
}

function groupById<Type extends Record<string, unknown>>(
    values: Array<Type>,
    property: keyof Type
): Record<string, Type[]> {
    return values.reduce(
        (acc, val) => {
            const key = val[property] as string
            if (!acc[key]) acc[key] = []
            acc[key].push(val)
            return acc
        },
        {} as Record<string | number, Type[]>
    )
}
