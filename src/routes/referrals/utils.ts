import type { GetSingleProviderResponse } from "$lib/types"

export function unpackProviders(row: GetSingleProviderResponse) {
    return {
        id: String(row.id),
        name: row.name,
        location: concatenateTruthyUnique(row.addresses.map(addr => addr.location))
    }
}

function concatenateTruthyUnique(arr: Array<string | null>, join: string = ", ") {
    return arr
        .filter(val => val)
        .filter(onlyUnique)
        .join(join)
}

function onlyUnique<T>(value: T, index: number, array: Array<T>) {
    return array.indexOf(value) === index
}
