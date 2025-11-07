import { db } from "$lib/server/db/index.js"
import { templates } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

export async function POST({ request, params }) {
    const body = await request.json()
    const text = body.text
    let parentId: null | string | number = params.id
    if (typeof parentId === "string") {
        parentId = Number(parentId)
    }
    logger.info(`Creating template with text ${text} and parent_id ${parentId}`)

    return json(
        await db
            .insert(templates)
            .values({ text, parentId: parentId as number | null })
            .returning()
    )
}

type PutRequest = {
    text: string | null
    parentId: number | null
    priority: number | null
}

export async function PUT({ params, request }) {
    const id = Number(params.id)
    const { text, parentId, priority } = (await request.json()) as PutRequest

    if (text === null || parentId === null || priority === null) {
        logger.error("Missing parameter in request.")
        return new Response(null, { status: 400 })
    }

    logger.info(`Patching template with id ${id}`)

    return json(await db.update(templates).set({ text, parentId, priority }).where(eq(templates.id, id)).returning())
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    logger.info(`Deleting template with id ${id}`)
    return await db
        .delete(templates)
        .where(eq(templates.id, id))
        .then(() => {
            return new Response(null, { status: 204 })
        })
        .catch(error => {
            logger.error(`Error deleting template with id ${id}:`, error)
            return new Response(null, { status: 500 })
        })
}
