import { logger } from "$lib/server/logging"
import { pool, type SqlDiagnosisSchema } from "$lib/server/sql"

export async function GET({ params }) {
    const id = params.id
    logger.info(`Getting diagnosis with id ${id}`)

    const query = {
        text: "SELECT * FROM diagnoses WHERE id = $1",
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
            logger.error(`Error getting diagnosis with id ${id}:`, error)
            return new Response(null, { status: 500 })
        })
}

export async function DELETE({ params }) {
    const id = params.id
    logger.info(`Deleting diagnosis with id ${id}`)
    const query = {
        text: "DELETE FROM diagnoses WHERE id = $1",
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
            logger.error(`Error deleting diagnosis with id ${id}:`, error)
            return new Response(null, { status: 500 })
        })
}

export async function PATCH({ params, request }) {
    const id = params.id
    let { text, parent_id } = await request.json()
    logger.info(`Patching diagnosis with id ${id}`)

    const existingDiagnosis = await pool.connect().then(async client => {
        const result = await client.query({
            text: "SELECT * FROM diagnoses WHERE id = $1",
            values: [id]
        })
        client.release()
        return result.rows[0] as SqlDiagnosisSchema
    })

    if (!existingDiagnosis) {
        throw new Error(`Diagnosis with id ${id} not found`)
    }
    if (existingDiagnosis) {
        text = text ?? existingDiagnosis.text
        parent_id = parent_id ?? existingDiagnosis.parent_id
    }

    const query = {
        text: "UPDATE diagnoses SET",
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
            logger.error(`Error patching diagnosis with id ${id}:`, error)
            return new Response(null, { status: 500 })
        })
}
