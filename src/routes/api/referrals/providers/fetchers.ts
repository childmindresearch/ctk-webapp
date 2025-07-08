import { db } from "$lib/server/db"
import {
    referralProviders,
    referralAddresses,
    referralServices,
    referralProviderSubServices,
    referralSubServices
} from "$lib/server/db/schema.js"
import type { GetProviderResponse } from "$lib/types"
import { inArray, eq } from "drizzle-orm"

export async function getProviders(ids: number | number[] | undefined = undefined): Promise<GetProviderResponse> {
    let providers
    if (ids === undefined) {
        providers = await db.select().from(referralProviders)
    } else {
        ids = Array.isArray(ids) ? ids : [ids]
        providers = await db.select().from(referralProviders).where(inArray(referralProviders.id, ids))
    }

    const [addresses, serviceTypesData, subServicesData] = await Promise.all([
        db.select().from(referralAddresses),
        db.select().from(referralServices),
        db
            .select({
                providerId: referralProviderSubServices.providerId,
                subServiceId: referralSubServices.id,
                subServiceName: referralSubServices.name,
                serviceId: referralSubServices.serviceId
            })
            .from(referralProviderSubServices)
            .innerJoin(referralSubServices, eq(referralProviderSubServices.subServiceId, referralSubServices.id))
    ])

    const groupedAddresses = groupById(addresses, "providerId")
    const serviceTypesMap = Object.fromEntries(serviceTypesData.map(st => [st.id, st.name]))
    const groupedSubServices = groupById(subServicesData, "providerId")

    const providersWithRelations: GetProviderResponse = providers.map(providerData => {
        const providerId = providerData.id
        const providerSubServices = groupedSubServices[providerId] || []

        return {
            ...providerData,
            addresses: groupedAddresses[providerId] || [],
            serviceType: serviceTypesMap[providerData.serviceId],
            subServices: providerSubServices.map(subService => ({
                id: subService.subServiceId,
                name: subService.subServiceName,
                serviceId: subService.serviceId
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
