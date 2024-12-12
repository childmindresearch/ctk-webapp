import type { referralProviders } from "./db/schema"

export type Relation = {
    id: number
    name: string
}
export type ExtendedProvider = Omit<typeof referralProviders.$inferInsert, "id"> & {
    id: number
    languages?: Relation[]
    services?: Relation[]
    areasCovered?: Relation[]
}
