import { pgTable, serial, varchar, integer, boolean, pgEnum } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    isAdmin: boolean("is_admin")
})

// DSM codes table
export const dsmCodes = pgTable("dsm_codes", {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 255 }).notNull(),
    label: varchar("label", { length: 255 }).notNull()
})

// Templates table
export const templates = pgTable("html_templates", {
    id: serial("id").primaryKey(),
    text: varchar("text", { length: 8000 }).notNull(),
    parentId: integer("parent_id"),
    priority: integer("priority").notNull().default(0)
})

// Location type enum
export const locationTypeEnum = pgEnum("location_type", ["unknown", "remote", "in-person", "hybrid"])

// Referral providers table (simplified - service as string, sub_services as array)
export const referralProviders = pgTable("referral_providers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull().unique(),
    acceptsInsurance: boolean("accepts_insurance").notNull(),
    insuranceDetails: varchar("insurance_details", { length: 1024 }).notNull(),
    minAge: integer("min_age").default(0).notNull(),
    maxAge: integer("max_age").default(120).notNull(),
    notes: varchar("notes", { length: 1023 }).notNull().default(""),
    service: varchar("service", { length: 255 }).notNull(),
    subServices: varchar("sub_services", { length: 255 }).array().notNull().default([])
})

// Referral addresses table
export const referralAddresses = pgTable("referral_addresses", {
    id: serial("id").primaryKey(),
    providerId: integer("provider_id")
        .notNull()
        .references(() => referralProviders.id, { onDelete: "cascade" }),
    location: varchar("location", { length: 255 }).notNull(),
    locationType: locationTypeEnum("location_type").notNull().default("unknown"),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 20 }),
    contacts: varchar("contacts", { length: 255 }).array().notNull().default([])
})

// Referral filter groups table
export const referralFilterGroups = pgTable("referral_filter_groups", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique()
})

// Referral filter sets table
export const referralFilterSets = pgTable("referral_filter_sets", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    locations: varchar("locations", { length: 255 }).array().default([]),
    services: varchar("services", { length: 255 }).array().default([]),
    groupId: integer("group_id")
        .notNull()
        .references(() => referralFilterGroups.id, { onDelete: "cascade" })
})

// Relations
export const referralProviderRelations = relations(referralProviders, ({ many }) => ({
    addresses: many(referralAddresses)
}))

export const referralAddressRelations = relations(referralAddresses, ({ one }) => ({
    provider: one(referralProviders, {
        fields: [referralAddresses.providerId],
        references: [referralProviders.id]
    })
}))

export const templatesRelations = relations(templates, ({ one, many }) => ({
    parent: one(templates, {
        fields: [templates.parentId],
        references: [templates.id]
    }),
    children: many(templates)
}))

export const referralFilterSetsRelations = relations(referralFilterSets, ({ one }) => ({
    group: one(referralFilterGroups, {
        fields: [referralFilterSets.groupId],
        references: [referralFilterGroups.id]
    })
}))

export const referralFilterGroupsRelations = relations(referralFilterGroups, ({ many }) => ({
    filterSets: many(referralFilterSets)
}))
