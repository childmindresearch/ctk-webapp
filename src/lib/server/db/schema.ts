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
    table => [unique().on(table.providerId, table.subServiceId)]
)

export const referralProviders = pgTable("referral_providers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    acceptsInsurance: boolean("accepts_insurance").notNull(),
    minAge: integer("min_age").default(0).notNull(),
    maxAge: integer("max_age").default(120).notNull(),
    insuranceDetails: varchar("insurance_details", { length: 1024 }).notNull(),
    serviceId: integer("service_id")
        .references(() => referralServices.id)
        .notNull(),
    notes: varchar("notes", { length: 1024 }).notNull().default("")
})

export const referralAddresses = pgTable("referral_addresses", {
    id: serial("id").primaryKey(),
    providerId: integer("provider_id")
        .notNull()
        .references(() => referralProviders.id, { onDelete: "cascade" }),
    location: varchar("location", { length: 255 }).notNull(),
    locationType: varchar("location_type", { enum: ["unknown", "remote", "in-person", "hybrid"] })
        .notNull()
        .default("unknown"),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 20 }),
    contacts: text("contacts").array().notNull()
})

export const referralFilterGroups = pgTable("referral_filter_groups", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull()
})

export const referralFilterSets = pgTable("referral_filter_sets", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    locations: varchar("locations", { length: 255 }).array().default([]).notNull(),
    groupId: integer("group_id")
        .notNull()
        .references(() => referralFilterGroups.id, { onDelete: "cascade" })
})

// Junction Tables
export const referralProviderSubServicesJunction = pgTable(
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
    table => {
        return [unique().on(table.providerId, table.subServiceId)]
    }
)

export const referralFilterSetServiceJunction = pgTable(
    "referral_filter_set_services_relations",
    {
        id: serial("id").primaryKey(),
        filterSetId: integer("filter_set_id")
            .notNull()
            .references(() => referralFilterSets.id, { onDelete: "cascade" }),
        serviceId: integer("service_id")
            .notNull()
            .references(() => referralServices.id, { onDelete: "cascade" })
    },
    table => [unique().on(table.filterSetId, table.serviceId)]
)

// Relations
export const referralProviderRelations = relations(referralProviders, ({ one, many }) => ({
    service: one(referralServices, {
        fields: [referralProviders.serviceId],
        references: [referralServices.id]
    }),
    addresses: many(referralAddresses),
    subServices: many(referralProviderSubServicesJunction)
}))

export const referralAddressRelations = relations(referralAddresses, ({ one }) => ({
    provider: one(referralProviders, {
        fields: [referralAddresses.providerId],
        references: [referralProviders.id]
    })
}))

export const referralServicesRelations = relations(referralServices, ({ many }) => ({
    providers: many(referralProviders),
    subServices: many(referralSubServices),
    filterSets: many(referralFilterSetServiceJunction)
}))

export const referralSubServicesRelations = relations(referralSubServices, ({ one, many }) => ({
    service: one(referralServices, {
        fields: [referralSubServices.serviceId],
        references: [referralServices.id]
    }),
    providers: many(referralProviderSubServicesJunction)
}))

export const providersToSubServicesRelations = relations(referralProviderSubServicesJunction, ({ one }) => ({
    providers: one(referralProviders, {
        fields: [referralProviderSubServicesJunction.providerId],
        references: [referralProviders.id]
    }),
    subServices: one(referralSubServices, {
        fields: [referralProviderSubServicesJunction.subServiceId],
        references: [referralSubServices.id]
    })
}))

export const filterSetsRelations = relations(referralFilterSets, ({ one, many }) => ({
    group: one(referralFilterGroups, {
        fields: [referralFilterSets.groupId],
        references: [referralFilterGroups.id]
    }),
    services: many(referralFilterSetServiceJunction)
}))

export const filterSetsToServicesRelations = relations(referralFilterSetServiceJunction, ({ one }) => ({
    filterSet: one(referralFilterSets, {
        fields: [referralFilterSetServiceJunction.filterSetId],
        references: [referralFilterSets.id]
    }),
    service: one(referralServices, {
        fields: [referralFilterSetServiceJunction.serviceId],
        references: [referralServices.id]
    })
}))

export const referralFilterGroupsRelations = relations(referralFilterGroups, ({ many }) => ({
    filterSets: many(referralFilterSets)
}))
