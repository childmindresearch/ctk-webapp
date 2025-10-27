import { logger } from "$lib/server/logging"
import { pool, type SqlDsmCodeSchema } from "$lib/server/sql"

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
  const { code, label } = await request.json()
  return await pool
    .connect()
    .then(async client => {
      const result = await client.query({
        text: "INSERT INTO dsm_codes (code, label) VALUES ($1, $2) RETURNING id, code, label",
        values: [code, label]
      })
      client.release()
      return result.rows as SqlDsmCodeSchema[]
    })
    .then(rows => {
      return new Response(JSON.stringify(rows[0]), { headers: { "Content-Type": "application/json" } })
    })
    .catch(error => {
      logger.error("Error getting all templates:", error)
      return new Response(null, { status: 500 })
    })
}
