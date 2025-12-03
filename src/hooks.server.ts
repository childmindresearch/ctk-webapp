import { eq } from "drizzle-orm"
import type { RouteId } from "$app/types"
import { db } from "$lib/server/db"
import { users } from "$lib/server/db/schema"
import { DEVELOPMENT_USER } from "$lib/server/environment"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils"
import type { HandleFetch, RequestEvent } from "@sveltejs/kit"
import { randomUUID } from "crypto"
import { performance } from "perf_hooks"
import { addRootTracingData } from "$lib/telemetry"

type Endpoint = {
    path: string
    method: "GET" | "PATCH" | "POST" | "PUT" | "DELETE"
}

const ADMIN_ENDPOINT_PATHS = ["/api/templates/(?!download).*?", "/api/dsm/.*?", ".*?/admin/.*?"]
const ADMIN_SPECIFIC_ENDPOINTS: Endpoint[] = [
    { path: "/api/dsm", method: "POST" },
    { path: "/api/dsm", method: "PUT" }
]

/* Logs outgoing fetches and their responses. */
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
    logger.debug({
        type: `Server Request`,
        method: request.method,
        url: request.url,
        user: event.locals.user,
        requestId: event.locals.requestId
    })

    const logResponseData: {
        type: string
        url: string
        user: string
        requestId: string
        status?: number
        error?: string
    } = {
        type: "Server Response",
        url: request.url,
        user: event.locals.user,
        requestId: event.locals.requestId
    }

    request.headers.set("X-Request-Id", event.locals.requestId)
    request.headers.set("X-User", event.locals.user)
    let response: Response
    try {
        response = await fetch(request)
    } catch (e) {
        logger.error({ ...logResponseData, status: 500, error: "Failed to contact server." })
        throw e
    }

    logResponseData.status = response.status
    if (logResponseData.status >= 400) {
        try {
            logResponseData.error = await response.clone().text()
        } catch (e) {
            logger.error(e)
            logResponseData.error = "Could not parse error response."
        }
    }

    return response
}

/* Logs requests coming in and their response time. */
export async function handle({ event, resolve }) {
    const requestId = randomUUID()
    const startTime = performance.now()

    const userEmail = event.request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME") || DEVELOPMENT_USER
    logger.info({
        type: `User Request`,
        method: event.request.method,
        url: event.request.url,
        user: userEmail,
        requestId
    })
    event.locals.requestId = requestId
    event.locals.user = userEmail
    event.tracing.root.setAttribute("ctk-user", userEmail)

    const user = await getOrInsertUser(userEmail)
    if (!user) {
        logger.error({
            type: "User Request",
            message: "Could not find user email",
            user: userEmail,
            requestId,
            headers: Object.fromEntries(event.request.headers.entries())
        })
        return new Response("Could not find user email", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }
    if (!isUserAuthorized(event, user)) {
        const endTime = performance.now()
        const responseTime = `${(endTime - startTime).toFixed(3)}ms`
        logger.error({
            type: "Unauthorized",
            method: event.request.method,
            url: event.request.url,
            user: userEmail,
            requestId,
            responseTime
        })
        return new Response("Unauthorized", { status: StatusCode.UNAUTHORIZED })
    }

    const response = await resolve(event)

    const endTime = performance.now()
    const responseTime = `${(endTime - startTime).toFixed(3)}ms`
    const logMessage = {
        type: "User Response",
        statusCode: response.status,
        method: event.request.method,
        url: event.request.url,
        user: userEmail,
        requestId,
        responseTime
    }

    if (!response.ok) {
        logger.error(logMessage)
    } else {
        logger.info(logMessage)
    }

    response.headers.append("X-Request-ID", requestId)

    return response
}

async function getOrInsertUser(email: string): Promise<typeof users.$inferSelect> {
    const user = await db.select().from(users).where(eq(users.email, email))
    if (user.length === 1) return user[0]
    if (user.length > 1) {
        throw new Error("More than one user found. This should never happen.")
    }
    return (await db.insert(users).values({ email }).returning())[0]
}

function isUserAuthorized(
    event: RequestEvent<Partial<Record<string, string>>, RouteId | null>,
    user: typeof users.$inferSelect
): boolean {
    if (!user.isAdmin && ADMIN_ENDPOINT_PATHS.some(path => event.request.url.match(path))) {
        return false
    }

    for (const endpoint of ADMIN_SPECIFIC_ENDPOINTS) {
        if (!user.isAdmin && event.request.url.match(endpoint.path) && event.request.method === endpoint.method) {
            return false
        }
    }
    return true
}
