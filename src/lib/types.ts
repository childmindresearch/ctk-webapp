export type User = {
    id: number
    email: string
    is_admin: boolean
    is_alpha_user: boolean
}

export type Address = {
    id: number
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    contacts: string[] | null
}

export type GetSingleProviderResponse = {
    id: number
    name: string
    locations: Array<{
        id: number
        name: string
    }>
    addresses: Address[]
}

export type GetProviderResponse = GetSingleProviderResponse[]
