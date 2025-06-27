import type { GetProviderResponse, GetSingleProviderResponse } from "$lib/types"

export function concatenateTruthyUnique(arr: Array<string | null>, join: string = ", ") {
    return arr
        .filter(val => val)
        .filter(onlyUnique)
        .join(join)
}

export function onlyUnique<T>(value: T, index: number, array: Array<T>) {
    return array.indexOf(value) === index
}

type Address = {
    addressLine1: string | null
    addressLine2: string | null
    isRemote: boolean
    city: string | null
    state: string | null
    zipCode: string | null
    contacts: string[] | null
    location: string
}

export type ProviderFormData = {
    [key: string]: string | number | boolean | null | Address[] | string[]
    name: string
    acceptsInsurance: boolean
    insuranceDetails: string | null
    minAge: number
    maxAge: number
    addresses: Address[]
    serviceType: string | null
    subServices: string[]
}

export function exportProviders(providers: GetProviderResponse) {
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

function formatAddresses(provider: GetSingleProviderResponse) {
    return provider.addresses
        ?.map(addr => {
            const contacts = addr.contacts?.join(", ")
            if (addr.isRemote) {
                return ["Remote", contacts].filter(Boolean).join(", ")
            } else {
                return [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode, addr.state, contacts]
                    .filter(Boolean)
                    .join(", ")
            }
        })
        .join("\n\n")
}

function formatLocations(provider: GetSingleProviderResponse) {
    return provider.addresses?.map(addr => addr.location).join(", ") || ""
}
