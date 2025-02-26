import { logger } from "$lib/server/logging"
import { randomUUID } from "crypto"
import { performance } from "perf_hooks"
import { pool } from "$lib/server/sql"
import { DEVELOPMENT_USER } from "$lib/server/environment"
import type { User } from "$lib/types"
import type { HandleFetch, RequestEvent } from "@sveltejs/kit"

type Endpoint = {
    path: string
    method: "GET" | "PATCH" | "POST" | "PUT" | "DELETE"
}

const ADMIN_ENDPOINT_PATHS = ["/api/templates/.*?", "/api/dsm/.*?", "/referrals/admin/.*"]
const ADMIN_SPECIFIC_ENDPOINTS: Endpoint[] = [{ path: "/api/dsm", method: "POST" }]

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

    const user = await getOrInsertUser(userEmail)
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
        return new Response("Unauthorized", { status: 401 })
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

    if (response.status >= 400) {
        logger.error(logMessage)
    } else {
        logger.info(logMessage)
    }

    response.headers.append("X-Request-ID", requestId)

    return response
}

// Exported for testing purposes.
export async function getOrInsertUser(email: string) {
    return await pool.connect().then(async client => {
        const getUserQuery = {
            text: "SELECT * FROM users WHERE email = $1",
            values: [email]
        }
        const getResult = await client.query(getUserQuery)
        if (getResult.rows.length > 0) {
            client.release()
            return getResult.rows[0] as User
        }

        const insertUserQuery = {
            text: "INSERT INTO users (email) VALUES ($1) RETURNING *",
            values: [email]
        }
        const insertResult = await client.query(insertUserQuery)
        client.release()
        return insertResult.rows[0] as User
    })
}

function isUserAuthorized(event: RequestEvent<Partial<Record<string, string>>, string | null>, user: User) {
    if (!user.is_admin && ADMIN_ENDPOINT_PATHS.some(path => event.request.url.match(path))) {
        return false
    }

    for (const endpoint of ADMIN_SPECIFIC_ENDPOINTS) {
        if (!user.is_admin && event.request.url.match(endpoint.path) && event.request.method === endpoint.method) {
            return false
        }
    }
    return true
}
