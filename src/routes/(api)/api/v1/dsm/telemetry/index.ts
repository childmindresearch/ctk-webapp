import { z } from "zod"
import { Endpoint, StatusCode } from "$lib/utils"

export const postDsmTelemetryRequestSchema = z.object({
    ids: z.number().array()
})

export type PostDsmTelemetryRequest = z.infer<typeof postDsmTelemetryRequestSchema>

const path = () => "/api/v1/dsm/telemetry"

/**
 * Endpoint for logging of DSM codes copied.
 * All copy behavior is client-side hence a specific endpoint must be hit for logging.
 */
export const PostDsmTelemetry = new Endpoint<null, typeof path, typeof postDsmTelemetryRequestSchema>({
    method: "POST",
    path: path,
    successCodes: [StatusCode.NO_CONTENT],
    schema: postDsmTelemetryRequestSchema
})
