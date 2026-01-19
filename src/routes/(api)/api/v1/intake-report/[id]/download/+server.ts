import { getRequestEvent } from "$app/server"
import { ctkFunctionsClient } from "$lib/server/ctk_functions/index.js"
import { StatusCode } from "$lib/utils.js"

export async function GET({ params }) {
    const mrn = params.id
    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-id", mrn)
    const { data, error } = await ctkFunctionsClient.GET("/intake-report/{mrn}", {
        params: {
            path: { mrn }
        }
    })
    if (error === undefined) {
        // OpenAPI does not correctly infer the response type for files.
        return new Response(data as ArrayBuffer)
    }
    return new Response("Could not fetch the intake report.", { status: StatusCode.INTERNAL_SERVER_ERROR })
}
