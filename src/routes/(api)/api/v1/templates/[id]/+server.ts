import { db } from "$lib/server/db/index.js"
import { templates } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { postTemplateSchema, putTemplateSchema, type PostTemplateRequest, type PutTemplateRequest } from "."
import { StatusCode } from "$lib/utils"
import { getRequestEvent } from "$app/server"

export async function POST({ request, params }) {
    let body: PostTemplateRequest
    try {
        body = postTemplateSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }
    let parentId: null | string | number = params.id
    if (typeof parentId === "string") {
        parentId = Number(parentId)
    }

    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-id", parentId)
    logger.info(`Creating template with text ${body.text} and parent_id ${parentId}`)
    const results = await db
        .insert(templates)
        .values({ text: body.text, parentId: parentId as number | null })
        .returning()
    if (results.length !== 1) {
        return new Response("Invalid response from database", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }

    return json(results[0], {
        status: StatusCode.CREATED
    })
}

export async function PUT({ params, request }) {
    const id = Number(params.id)

    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-id", id)
    let body: PutTemplateRequest
    try {
        body = putTemplateSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }
    logger.info(`Patching template with id ${id}`)
    const results = await db.update(templates).set(body).where(eq(templates.id, id)).returning()
    if (results.length !== 1) {
        return new Response("Invalid response from database", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }

    return json(results[0])
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    logger.info(`Deleting template with id ${id}`)

    const event = getRequestEvent()
    event.tracing.current.setAttribute("ctk-id", id)

    return await db
        .delete(templates)
        .where(eq(templates.id, id))
        .then(() => {
            const event = getRequestEvent()
            event.tracing.current.setAttribute("ctk-id", id)
            return new Response(null, { status: 204 })
        })
        .catch(error => {
            logger.error(`Error deleting template with id ${id}:`, error)
            return new Response(null, { status: 500 })
        })
}
