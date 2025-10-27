import { logger } from "$lib/server/logging"
import { pool } from "$lib/server/sql"

export async function POST({ request, params }) {
  const body = await request.json()
  const text = body.text
  let parentId: string | number = params.id
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

type PutRequest = {
  text: string | null
  parentId: number | null
  priority: number | null
}

export async function PUT({ params, request }) {
  const id = params.id
  const { text, parentId, priority } = (await request.json()) as PutRequest

  if (text === null || parentId === null || priority === null) {
    logger.error("Missing parameter in request.")
    return new Response(null, { status: 400 })
  }

  logger.info(`Patching template with id ${id}`)

  const query = {
    text: "UPDATE templates SET text = $1, parent_id = $2, priority = $3 WHERE id = $4",
    values: [text, parentId, priority, id]
  }

  logger.debug(query)

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
    .catch(error => {
      logger.error(`Error patching template with id ${id}:`, error)
      return new Response(null, { status: 500 })
    })
}

export async function DELETE({ params }) {
  const id = params.id
  logger.info(`Deleting template with id ${id}`)
  const query = {
    text: `
WITH RECURSIVE descendants AS (
    SELECT id
    FROM templates
    WHERE id = $1
    UNION ALL
    SELECT templates.id
    FROM templates
    INNER JOIN descendants ON templates.parent_id = descendants.id
)
DELETE FROM templates
WHERE id IN (SELECT descendants.id FROM descendants);`,
    values: [id]
  }

  return await pool
    .connect()
    .then(async client => {
      await client.query(query)
      client.release()
    })
    .then(() => {
      return new Response(null, { status: 204 })
    })
    .catch(error => {
      logger.error(`Error deleting template with id ${id}:`, error)
      return new Response(null, { status: 500 })
    })
}
