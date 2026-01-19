import { ctkFunctionsClient } from "$lib/server/ctk_functions/index.js"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils.js"

export async function GET() {
    logger.info("Warming up the server.")

    const { error } = await ctkFunctionsClient.GET("/health")
    if (error === undefined) {
        return new Response()
    }
    return new Response(error, { status: StatusCode.INTERNAL_SERVER_ERROR })
}
