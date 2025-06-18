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

export type SubService = {
    id: number
    name: string
    serviceTypeId: number
}

export type GetSingleProviderResponse = {
    [key: string]: string | number | boolean | null | Address[] | SubService[]
    id: number
    name: string
    acceptsInsurance: boolean
    insuranceDetails: string | null
    minAge: number
    maxAge: number
    addresses: Address[]
    serviceType: string | null
    subServices: SubService[]
}

export type GetProviderResponse = GetSingleProviderResponse[]
