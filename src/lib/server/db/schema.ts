import { pgTable, serial, varchar, integer, text, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const provider = pgTable("provider", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    acceptsInsurance: boolean("accepts_insurance").notNull(),
    insuranceDetails: varchar("insurance_details", { length: 1024 })
})

export const providerAddress = pgTable("provider_address", {
    id: serial("id").primaryKey(),
    location: varchar("location", { length: 255 }),
    providerId: integer("provider_id")
        .notNull()
        .references(() => provider.id),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 20 }),
    contacts: text("contacts").array()
})

export const providerRelations = relations(provider, ({ many }) => ({
    addresses: many(providerAddress)
}))

export const providerAddressRelations = relations(providerAddress, ({ one }) => ({
    provider: one(provider, {
        fields: [providerAddress.providerId],
        references: [provider.id]
    })
}))
