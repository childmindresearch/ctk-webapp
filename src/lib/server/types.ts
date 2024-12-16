import type { referralPresets, referralProviders } from "./db/schema"

export type Relation = {
    id: number
    name: string
}
export type ExtendedProvider = typeof referralProviders.$inferSelect & {
    languages: Relation[]
    services: Relation[]
    areasCovered: Relation[]
}

export type ExtendedPreset = typeof referralPresets.$inferSelect & {
    languages: Relation[]
    services: Relation[]
    areasCovered: Relation[]
}
