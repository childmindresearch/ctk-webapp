import { pgTable, serial, varchar, integer, text, boolean, unique } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const referralServices = pgTable("referral_services", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull()
})

export const referralSubServices = pgTable("referral_sub_services", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    serviceId: integer("service_id")
        .notNull()
        .references(() => referralServices.id, { onDelete: "cascade" })
})

export const referralProviderSubServices = pgTable(
    "referral_provider_sub_services",
    {
        id: serial("id").primaryKey(),
        providerId: integer("provider_id")
            .notNull()
            .references(() => referralProviders.id, { onDelete: "cascade" }),
        subServiceId: integer("sub_service_id")
            .notNull()
            .references(() => referralSubServices.id, { onDelete: "cascade" })
    },
    table => ({
        uniqueProviderSubService: unique().on(table.providerId, table.subServiceId)
    })
)

export const referralProviders = pgTable("referral_providers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    acceptsInsurance: boolean("accepts_insurance").notNull(),
    minAge: integer("min_age").default(0).notNull(),
    maxAge: integer("max_age").default(120).notNull(),
    insuranceDetails: varchar("insurance_details", { length: 1024 }),
    serviceId: integer("service_id")
        .references(() => referralServices.id)
        .notNull()
})

export const referralAddresses = pgTable("referral_addresses", {
    id: serial("id").primaryKey(),
    providerId: integer("provider_id")
        .notNull()
        .references(() => referralProviders.id, { onDelete: "cascade" }),
    isRemote: boolean("is_remote").notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 20 }),
    contacts: text("contacts").array()
})

export const referralFilterSets = pgTable("referral_filter_sets", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    locations: varchar("locations", { length: 255 }).array().notNull()
})

// Relations
export const referralFilterSetRelations = pgTable(
    "referral_filter_set_service_relationship",
    {
        id: serial("id").primaryKey(),
        filterSetId: integer("filter_set_id")
            .notNull()
            .references(() => referralFilterSets.id, { onDelete: "cascade" }),
        serviceId: integer("service_id")
            .notNull()
            .references(() => referralServices.id, { onDelete: "cascade" })
    },
    table => ({
        uniqueFilterSetService: unique().on(table.filterSetId, table.serviceId)
    })
)

export const referralServicesRelations = relations(referralServices, ({ many }) => ({
    subServices: many(referralSubServices),
    providers: many(referralProviders)
}))

export const referralSubServicesRelations = relations(referralSubServices, ({ one, many }) => ({
    service: one(referralServices, {
        fields: [referralSubServices.serviceId],
        references: [referralServices.id]
    }),
    providerSubServices: many(referralProviderSubServices)
}))

export const referralProvidersRelations = relations(referralProviders, ({ one, many }) => ({
    service: one(referralServices, {
        fields: [referralProviders.serviceId],
        references: [referralServices.id]
    }),
    addresses: many(referralAddresses),
    providerSubServices: many(referralProviderSubServices)
}))

export const referralProviderAddressesRelations = relations(referralAddresses, ({ one }) => ({
    provider: one(referralProviders, {
        fields: [referralAddresses.providerId],
        references: [referralProviders.id]
    })
}))

export const referralProviderSubServicesRelations = relations(referralProviderSubServices, ({ one }) => ({
    provider: one(referralProviders, {
        fields: [referralProviderSubServices.providerId],
        references: [referralProviders.id]
    }),
    subService: one(referralSubServices, {
        fields: [referralProviderSubServices.subServiceId],
        references: [referralSubServices.id]
    })
}))
