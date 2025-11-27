import { logger } from "$lib/server/logging"
import { pool, type SqlDsmCodeSchema } from "$lib/server/sql"
import { StatusCode } from "$lib/utils"
import { postDsmRequestSchema, type PostDsmRequest } from "./index.js"

export async function GET() {
    logger.info("Getting all DSM codes")
    return await pool
        .connect()
        .then(async client => {
            const result = await client.query("SELECT * FROM dsm_codes")
            client.release()
            return result.rows as SqlDsmCodeSchema[]
        })
        .then(rows => {
            return new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json" } })
        })
        .catch(error => {
            logger.error("Error getting all templates:", error)
            return new Response(null, { status: 500 })
        })
}

export async function POST({ request }) {
    logger.info("Posting a new DSM code")
    let body: PostDsmRequest
    try {
        body = postDsmRequestSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }
    return await pool
        .connect()
        .then(async client => {
            const result = await client.query({
                text: "INSERT INTO dsm_codes (code, label) VALUES ($1, $2) RETURNING id, code, label",
                values: [body.code, body.label]
            })
            client.release()
            return result.rows as SqlDsmCodeSchema[]
        })
        .then(rows => {
            return new Response(JSON.stringify(rows[0]), {
                headers: { "Content-Type": "application/json" },
                status: StatusCode.CREATED
            })
        })
        .catch(error => {
            logger.error("Error getting all templates:", error)
            return new Response(null, { status: 500 })
        })
}
