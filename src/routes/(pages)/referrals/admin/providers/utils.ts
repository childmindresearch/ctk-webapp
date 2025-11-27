import type { getProviders } from "$api/referrals/crud.js"
import { isUnique } from "$lib/utils"

export function concatenateTruthyUnique(arr: Array<string | null>, join: string = ", ") {
    return arr
        .filter(val => val)
        .filter(isUnique)
        .join(join)
}

type Address = {
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    contacts: string[]
    location: string
    locationType: "unknown" | "remote" | "in-person" | "hybrid"
}

export type ProviderFormData = {
    name: string
    acceptsInsurance: boolean
    insuranceDetails: string
    minAge: number
    maxAge: number
    addresses: Address[]
    service: string
    subServices: string[]
}

export function exportProviders(providers: Awaited<ReturnType<typeof getProviders>>) {
    const exportColumns = {
        name: "Name",
        location: "Location",
        addresses: "Contact",
        acceptsInsurance: "Accepts Insurance"
    } as const

    const headers = Object.values(exportColumns)
    const rows = providers.map(provider => {
        return [
            provider.name,
            formatLocations(provider),
            formatAddresses(provider),
            provider.acceptsInsurance ? provider.insuranceDetails : "No insurance accepted."
        ]
    })
    return [headers, ...rows]
}

function formatAddresses(provider: Awaited<ReturnType<typeof getProviders>>[number]) {
    return provider.addresses
        ?.map(addr => {
            const contacts = addr.contacts?.join(", ")
            return [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode, addr.state, contacts]
                .filter(Boolean)
                .join(", ")
        })
        .join("\n\n")
}

function formatLocations(provider: Awaited<ReturnType<typeof getProviders>>[number]) {
    return provider.addresses?.map(addr => addr.location).join(", ") || ""
}
