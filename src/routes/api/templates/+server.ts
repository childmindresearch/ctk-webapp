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
