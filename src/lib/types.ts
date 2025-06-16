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
    isRemote: boolean
    city: string | null
    state: string | null
    zipCode: string | null
    contacts: string[] | null
    location: string
}

export type GetSingleProviderResponse = {
    id: number
    name: string
    acceptsInsurance: boolean
    insuranceDetails: string | null
    addresses: Address[]
}

export type GetProviderResponse = GetSingleProviderResponse[]
