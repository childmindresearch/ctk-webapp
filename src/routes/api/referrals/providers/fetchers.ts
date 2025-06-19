import { db } from "$lib/server/db"
import { provider, providerAddress, serviceType, providerSubServices, subServiceType } from "$lib/server/db/schema.js"
import type { GetProviderResponse } from "$lib/types"
import { inArray, eq } from "drizzle-orm"

export async function getProviders(ids: number | number[] | undefined = undefined): Promise<GetProviderResponse> {
    let providers
    if (ids === undefined) {
        providers = await db.select().from(provider)
    } else {
        ids = Array.isArray(ids) ? ids : [ids]
        providers = await db.select().from(provider).where(inArray(provider.id, ids))
    }

    const [addresses, serviceTypesData, subServicesData] = await Promise.all([
        db
            .select({
                providerId: providerAddress.providerId,
                id: providerAddress.id,
                isRemote: providerAddress.isRemote,
                location: providerAddress.location,
                addressLine1: providerAddress.addressLine1,
                addressLine2: providerAddress.addressLine2,
                city: providerAddress.city,
                state: providerAddress.state,
                zipCode: providerAddress.zipCode,
                contacts: providerAddress.contacts
            })
            .from(providerAddress),

        db
            .select({
                id: serviceType.id,
                name: serviceType.name
            })
            .from(serviceType),

        db
            .select({
                providerId: providerSubServices.providerId,
                subServiceId: subServiceType.id,
                subServiceName: subServiceType.name,
                serviceTypeId: subServiceType.serviceTypeId
            })
            .from(subServiceType)
            .innerJoin(providerSubServices, eq(providerSubServices.subServiceTypeId, subServiceType.id))
    ])

    const groupedAddresses = groupById(addresses, "providerId")
    const groupedSubServices = groupById(subServicesData, "providerId")
    const serviceTypesMap = Object.fromEntries(serviceTypesData.map(st => [st.id, st.name]))

    const providersWithRelations: GetProviderResponse = providers.map(providerData => {
        const providerId = providerData.id
        const providerSubServices = groupedSubServices[providerId] || []

        return {
            ...providerData,
            addresses: groupedAddresses[providerId] || [],
            serviceType: providerData.serviceTypeId ? serviceTypesMap[providerData.serviceTypeId] : null,
            subServices: providerSubServices.map(subService => ({
                id: subService.subServiceId,
                name: subService.subServiceName,
                serviceTypeId: subService.serviceTypeId
            }))
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
