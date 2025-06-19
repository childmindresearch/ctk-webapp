import { type GetSingleProviderResponse } from "$lib/types"

export function unpackProviders(row: GetSingleProviderResponse) {
    return {
        ...row,
        id: String(row.id),
        location: concatenateTruthyUnique(row.addresses.map(addr => addr.location)),
        subServices: concatenateTruthyUnique(row.subServices.map(s => s.name)),
        addresses: row.addresses
            .map(addr => {
                if (addr.isRemote) return "Remote"
                return [addr.addressLine1, addr.addressLine2, addr.city, addr.zipCode, addr.state]
                    .filter(value => value !== null)
                    .join(", ")
            })
            .join("\n")
    }
}

export function concatenateTruthyUnique(arr: Array<string | null>, join: string = ", ") {
    return arr
        .filter(val => val)
        .filter(onlyUnique)
        .join(join)
}

export function onlyUnique<T>(value: T, index: number, array: Array<T>) {
    return array.indexOf(value) === index
}
