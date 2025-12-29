CREATE TYPE "public"."location_type" AS ENUM('unknown', 'remote', 'in-person', 'hybrid');--> statement-breakpoint
CREATE TABLE "dsm_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(255) NOT NULL,
	"label" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider_id" integer NOT NULL,
	"location" varchar(255) NOT NULL,
	"location_type" "location_type" DEFAULT 'unknown' NOT NULL,
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(20),
	"contacts" varchar(255)[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_filter_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "referral_filter_groups_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "referral_filter_sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"locations" varchar(255)[] DEFAULT '{}',
	"services" varchar(255)[] DEFAULT '{}',
	"group_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(500) NOT NULL,
	"accepts_insurance" boolean NOT NULL,
	"insurance_details" varchar(1024) NOT NULL,
	"min_age" integer DEFAULT 0 NOT NULL,
	"max_age" integer DEFAULT 120 NOT NULL,
	"notes" varchar(1023) DEFAULT '' NOT NULL,
	"service" varchar(255) NOT NULL,
	"sub_services" varchar(255)[] DEFAULT '{}' NOT NULL,
	CONSTRAINT "referral_providers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "html_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"text" varchar(8000) NOT NULL,
	"parent_id" integer,
	"priority" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_admin" boolean
);
--> statement-breakpoint
ALTER TABLE "referral_addresses" ADD CONSTRAINT "referral_addresses_provider_id_referral_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."referral_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referral_filter_sets" ADD CONSTRAINT "referral_filter_sets_group_id_referral_filter_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."referral_filter_groups"("id") ON DELETE cascade ON UPDATE no action;