import { getRequestEvent } from "$app/server"
import { ctkFunctionsClient } from "$lib/server/ctk_functions/index.js"
import { StatusCode } from "$lib/utils.js"

export async function GET({ params }) {
    const mrn = params.id
    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-id", mrn)
    const { data, error } = await ctkFunctionsClient.GET("/pyrite/{mrn}", {
        params: {
            path: { mrn }
        },
        parseAs: "blob"
    })
    if (error === undefined) {
        return new Response(data)
    }
    return new Response("Could not fetch the intake report.", { status: StatusCode.INTERNAL_SERVER_ERROR })
}
