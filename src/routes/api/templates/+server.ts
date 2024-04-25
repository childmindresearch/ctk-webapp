import { logger } from "$lib/server/logging"
import { pool } from "$lib/server/sql"

export async function GET() {
    logger.info("Getting all templates")
    return await pool
        .connect()
        .then(async client => {
            const result = await client.query("SELECT * FROM templates")
            client.release()
            return result.rows
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
    const body = await request.json()
    const text = body.text
    let parentId = body.parentId
    logger.info(`Creating template with text ${text} and parent_id ${parentId}`)
    if (parentId === null) {
        parentId = "NULL"
    }
    const query = {
        text: "INSERT INTO templates (text, parent_id) VALUES ($1, $2) RETURNING *",
        values: [text, String(parentId)]
    }

    return await pool
        .connect()
        .then(async client => {
            const result = await client.query(query)
            client.release()
            return result.rows[0]
        })
        .then(row => {
            return new Response(JSON.stringify(row), { headers: { "Content-Type": "application/json" } })
        })
}
