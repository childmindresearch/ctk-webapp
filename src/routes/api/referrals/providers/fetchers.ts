import { db } from "$lib/server/db"
import { provider, providerAddress } from "$lib/server/db/schema.js"
import type { GetProviderResponse } from "$lib/types"
import { inArray } from "drizzle-orm"

export async function getProviders(ids: number | number[] | undefined = undefined): Promise<GetProviderResponse> {
    let providers
    if (ids === undefined) {
        providers = await db.select().from(provider)
    } else {
        ids = Array.isArray(ids) ? ids : [ids]
        providers = await db.select().from(provider).where(inArray(provider.id, ids))
    }

    const [addresses] = await Promise.all([
        db
            .select({
                providerId: providerAddress.providerId,
                id: providerAddress.id,
                location: providerAddress.location,
                addressLine1: providerAddress.addressLine1,
                addressLine2: providerAddress.addressLine2,
                city: providerAddress.city,
                state: providerAddress.state,
                zipCode: providerAddress.zipCode,
                contacts: providerAddress.contacts
            })
            .from(providerAddress)
    ])

    const groupedAddresses = groupById(addresses, "providerId")

    const providersWithRelations: GetProviderResponse = providers.map(providerData => {
        const providerId = providerData.id
        return {
            ...providerData,
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
