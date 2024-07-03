import { logger } from "$lib/server/logging"
import { pool, type SqlTemplateSchema } from "$lib/server/sql"

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

export async function GET({ params }) {
    const id = params.id
    logger.info(`Getting template with id ${id}`)

    const query = {
        text: "SELECT * FROM templates WHERE id = $1",
        values: [id]
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
        .catch(error => {
            logger.error(`Error getting template with id ${id}:`, error)
            return new Response(null, { status: 500 })
        })
}

export async function PATCH({ params, request }) {
    const id = params.id
    let { text, parent_id } = await request.json()
    logger.info(`Patching template with id ${id}`)

    const existingtemplate = await pool.connect().then(async client => {
        const result = await client.query({
            text: "SELECT * FROM templates WHERE id = $1",
            values: [id]
        })
        client.release()
        return result.rows[0] as SqlTemplateSchema
    })

    if (!existingtemplate) {
        throw new Error(`template with id ${id} not found`)
    }
    if (existingtemplate) {
        text = text ?? existingtemplate.text
        parent_id = parent_id ?? existingtemplate.parent_id
    }

    const query = {
        text: "UPDATE templates SET",
        values: [] as string[]
    }

    if (text !== undefined) {
        query.text += ` text = $${query.values.length + 1},`
        query.values.push(text)
    }

    if (parent_id !== undefined) {
        query.text += ` parent_id = $${query.values.length + 1},`
        query.values.push(String(parent_id))
    }

    query.text = query.text.slice(0, -1) + ` WHERE id = $${query.values.length + 1}`
    query.values.push(String(id))

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
