import { logger } from "$lib/server/logging"
import { pool, type SqlDsmCodeSchema } from "$lib/server/sql"

export async function PUT({ params, request }) {
    const id = params.id
    const { code, label } = await request.json()
    logger.info("Editing DSM Code")
    return await pool
        .connect()
        .then(async client => {
            const result = await client.query({
                text: "UPDATE dsm_codes SET code = $1, label = $2 WHERE id = $3",
                values: [code, label, id]
            })
            client.release()
            return result.rows as SqlDsmCodeSchema[]
        })
        .then(rows => {
            return new Response(JSON.stringify(rows), { headers: { "Content-Type": "application/json" } })
        })
        .catch(error => {
            logger.error("Error getting all dsm codes:", error)
            return new Response(null, { status: 500 })
        })
}

export async function DELETE({ params }) {
    return await pool
        .connect()
        .then(async client => {
            await client.query({ text: "DELETE FROM dsm_codes WHERE id = $1", values: [params.id] })
        })
        .then(() => {
            return new Response(null)
        })
        .catch(error => {
            logger.error("Error deleting all dsm code:", error)
            return new Response(null, { status: 500 })
        })
}
