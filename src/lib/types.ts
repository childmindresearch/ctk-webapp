export type Address = {
    id: number
    addressLine1: string | null
    addressLine2: string | null
    isRemote: boolean
    city: string | null
    state: string | null
    zipCode: string | null
    contacts: string[] | null
    location: { id: number; name: string }
}

export type SubService = {
    id: number
    name: string
    serviceId: number
}

export type GetSingleFilterSetResponse = {
    id: number
    name: string
    locations: string[]
    services: { name: string; id: number }[]
}
export type GetFilterSetResponse = GetSingleFilterSetResponse[]
