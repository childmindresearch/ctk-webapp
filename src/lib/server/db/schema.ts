import { relations } from "drizzle-orm"
import { integer, text, boolean, pgTable, serial } from "drizzle-orm/pg-core"

// Table definitions
export const referralProviders = pgTable("referral_providers", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    website: text("website"),
    takesInsurance: boolean("takes_insurance").notNull(),
    description: text("description")
})

export const referralPresets = pgTable("referral_presets", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique()
})

export const referralServices = pgTable("referral_services", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique()
})

export const referralLanguages = pgTable("referral_languages", {
    id: serial("id").primaryKey(),
    name: text("name").notNull().unique()
})

// Relationships

export const providerRelations = relations(referralProviders, ({ many }) => ({
    providersToLanguages: many(providersToLanguages),
    providersToServices: many(providersToServices)
}))

export const presetsRelations = relations(referralPresets, ({ many }) => ({
    providersToLanguages: many(presetsToLanguages),
    providersToServices: many(presetsToServices)
}))

export const servicesRelations = relations(referralServices, ({ many }) => ({
    providersToServices: many(providersToServices),
    presetsToServices: many(presetsToServices)
}))

export const languagesRelations = relations(referralLanguages, ({ many }) => ({
    providersToServices: many(providersToLanguages),
    presetsToServices: many(presetsToLanguages)
}))

// Junction tables

export const providersToLanguages = pgTable("providers_to_languages", {
    providerId: integer("provider_id")
        .notNull()
        .references(() => referralProviders.id, { onDelete: "cascade" }),
    languageId: integer("language_id")
        .notNull()
        .references(() => referralLanguages.id, { onDelete: "cascade" })
})

export const providersToServices = pgTable("providers_to_services", {
    providerId: integer("provider_id")
        .notNull()
        .references(() => referralProviders.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
        .notNull()
        .references(() => referralServices.id, { onDelete: "cascade" })
})

export const presetsToLanguages = pgTable("presets_to_languages", {
    presetId: integer("preset_id")
        .notNull()
        .references(() => referralPresets.id, { onDelete: "cascade" }),
    languageId: integer("language_id")
        .notNull()
        .references(() => referralLanguages.id, { onDelete: "cascade" })
})

export const presetsToServices = pgTable("presets_to_services", {
    presetId: integer("preset_id")
        .notNull()
        .references(() => referralPresets.id, { onDelete: "cascade" }),
    serviceId: integer("service_id")
        .notNull()
        .references(() => referralServices.id, { onDelete: "cascade" })
})
