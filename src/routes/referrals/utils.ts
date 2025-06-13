import type { GetSingleProviderResponse } from "$lib/types"

export function unpackProviders(row: GetSingleProviderResponse) {
    console.log(row)
    return {
        id: String(row.id),
        name: row.name,
        locations: row.locations.length ? concatenateTruthyUnique(row.locations.map(loc => loc.name)) : ""
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
