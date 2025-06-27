import { pgTable, serial, varchar, integer, text, boolean, unique } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const serviceType = pgTable("service_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull()
})

export const subServiceType = pgTable("sub_service_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    serviceTypeId: integer("service_type_id")
        .notNull()
        .references(() => serviceType.id, { onDelete: "cascade" })
})

export const provider = pgTable("provider", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    acceptsInsurance: boolean("accepts_insurance").notNull(),
    minAge: integer("min_age").notNull(),
    maxAge: integer("max_age").notNull(),
    insuranceDetails: varchar("insurance_details", { length: 1024 }),
    serviceTypeId: integer("service_type_id").references(() => serviceType.id)
})

export const providerAddress = pgTable("provider_address", {
    id: serial("id").primaryKey(),
    location: varchar("location", { length: 255 }).notNull(),
    providerId: integer("provider_id")
        .notNull()
        .references(() => provider.id),
    isRemote: boolean("is_remote").notNull(),
    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 50 }),
    zipCode: varchar("zip_code", { length: 20 }),
    contacts: text("contacts").array()
})

export const providerSubServices = pgTable(
    "provider_sub_services",
    {
        id: serial("id").primaryKey(),
        providerId: integer("provider_id")
            .notNull()
            .references(() => provider.id, { onDelete: "cascade" }),
        subServiceTypeId: integer("sub_service_type_id")
            .notNull()
            .references(() => subServiceType.id, { onDelete: "cascade" })
    },
    table => ({
        uniqueProviderSubService: unique().on(table.providerId, table.subServiceTypeId)
    })
)

export const serviceTypesRelations = relations(serviceType, ({ many }) => ({
    subServiceTypes: many(subServiceType),
    providers: many(provider)
}))

export const subServiceTypesRelations = relations(subServiceType, ({ one, many }) => ({
    serviceType: one(serviceType, {
        fields: [subServiceType.serviceTypeId],
        references: [serviceType.id]
    }),
    providerSubServices: many(providerSubServices)
}))

export const providerSubServicesRelations = relations(providerSubServices, ({ one }) => ({
    provider: one(provider, {
        fields: [providerSubServices.providerId],
        references: [provider.id]
    }),
    subServiceType: one(subServiceType, {
        fields: [providerSubServices.subServiceTypeId],
        references: [subServiceType.id]
    })
}))

export const providerRelations = relations(provider, ({ many }) => ({
    addresses: many(providerAddress)
}))

export const providerAddressRelations = relations(providerAddress, ({ one }) => ({
    provider: one(provider, {
        fields: [providerAddress.providerId],
        references: [provider.id]
    })
}))
