import { pgTable, serial, varchar, integer, boolean, primaryKey } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const providerLocation = pgTable("location", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull()
})

export const provider = pgTable("provider", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    acceptsInsurance: boolean("accepts_insurance").default(false)
})

export const providerAddress = pgTable("provider_address", {
    id: serial("id").primaryKey(),
    providerId: integer("provider_id")
        .notNull()
        .references(() => provider.id),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 20 })
})

export const providerLocationJunction = pgTable(
    "provider_location",
    {
        providerId: integer("provider_id")
            .notNull()
            .references(() => provider.id),
        locationId: integer("location_id")
            .notNull()
            .references(() => providerLocation.id)
    },
    table => ({
        pk: primaryKey({ columns: [table.providerId, table.locationId] })
    })
)
export const locationRelations = relations(providerLocation, ({ many }) => ({
    providerLocations: many(providerLocationJunction)
}))

export const providerRelations = relations(provider, ({ many }) => ({
    providerLocations: many(providerLocationJunction),
    addresses: many(providerAddress)
}))

export const providerLocationRelations = relations(providerLocationJunction, ({ one }) => ({
    provider: one(provider, {
        fields: [providerLocationJunction.providerId],
        references: [provider.id]
    }),
    location: one(providerLocation, {
        fields: [providerLocationJunction.locationId],
        references: [providerLocation.id]
    })
}))

export const providerAddressRelations = relations(providerAddress, ({ one }) => ({
    provider: one(provider, {
        fields: [providerAddress.providerId],
        references: [provider.id]
    })
}))
