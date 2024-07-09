import { logger } from "$lib/server/logging"
import { randomUUID } from "crypto"
import { performance } from "perf_hooks"
import { pool } from "$lib/server/sql"
import { DEVELOPMENT_USER } from "$lib/server/environment"
import type { User } from "$lib/databaseTypes"
import type { RequestEvent } from "@sveltejs/kit"

const ADMIN_ENDPOINTS = ["/api/templates/.*?"]

export async function handle({ event, resolve }) {
    const requestId = randomUUID()
    const startTime = performance.now()

    const userEmail = event.request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME") || DEVELOPMENT_USER
    logger.info({
        type: `Request`,
        method: event.request.method,
        url: event.request.url,
        user: userEmail,
        requestId
    })
    event.request.headers.set("X-Request-ID", requestId)
    event.request.headers.set("X-User", userEmail)

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
        type: "Response",
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

async function getOrInsertUser(email: string) {
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
    if (!user.is_admin && ADMIN_ENDPOINTS.some(endpoint => event.request.url.match(endpoint))) {
        return false
    }
    return true
}
