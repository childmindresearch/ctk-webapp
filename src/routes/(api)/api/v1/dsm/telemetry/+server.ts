import { getRequestEvent } from "$app/server"
import { StatusCode } from "$lib/utils.js"
import { postDsmTelemetryRequestSchema, type PostDsmTelemetryRequest } from "./index.js"

export async function POST({ request }) {
    let body: PostDsmTelemetryRequest
    try {
        body = postDsmTelemetryRequestSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }

    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-ids", body.ids)
    return new Response(null, { status: StatusCode.NO_CONTENT })
}
