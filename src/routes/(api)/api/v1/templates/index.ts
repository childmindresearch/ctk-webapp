import { Endpoint, StatusCode } from "$lib/utils"
import type { templates } from "$lib/server/db/schema"

export * from "./download"
export * from "./[id]"

export type GetTemplatesResponse = (typeof templates.$inferSelect)[]

const path = () => "/api/v1/templates"
/**
 * Endpoint to retrieve all template records from the database.
 * Use the .fetch() method to run the query.
 */
export const GetTemplates = new Endpoint<GetTemplatesResponse, typeof path>({
     method: "GET",
     path,
     successCodes: [StatusCode.OK]
 })
