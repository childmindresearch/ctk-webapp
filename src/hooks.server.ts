import { logger } from "$lib/server/logging"
import { randomUUID } from "crypto"
import { performance } from "perf_hooks"

export async function handle({ event, resolve }) {
    const requestId = randomUUID()
    const startTime = performance.now()

    const user = event.request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME") || "development.user@example.com"
    logger.info({
        type: `Request`,
        method: event.request.method,
        url: event.request.url,
        user,
        requestId
    })
    event.request.headers.set("X-Request-ID", requestId)
    event.request.headers.set("X-User", user)

    const response = await resolve(event)

    const endTime = performance.now()
    const responseTime = `${(endTime - startTime).toFixed(3)}ms`
    const logMessage = {
        type: "Response",
        statusCode: response.status,
        method: event.request.method,
        url: event.request.url,
        user,
        requestId,
        responseTime
    }

    if (response.status >= 400) {
        logger.error(logMessage)
    } else {
        logger.info(logMessage)
    }

    response.headers.append("X-Request-ID", requestId)

    return response
}
