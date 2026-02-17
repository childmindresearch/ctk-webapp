import { db } from "$lib/server/db"
import { templates } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils"
import { error } from "@sveltejs/kit"
import { eq, inArray } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { postTemplateDownloadSchema } from "./index.js"
import { getRequestEvent } from "$app/server"
import { exportTemplates, type TemplateParagraph } from "./controller.js"

export async function POST({ request }) {
    try {
        const body = postTemplateDownloadSchema.parse(await request.json())
        const event = getRequestEvent()
        event.tracing.current.setAttribute("ctk-ids", body.templateIds)
        const parent = alias(templates, "parent")
        const rows = await db
            .select({
                id: templates.id,
                content: templates.text,
                title: parent.text
            })
            .from(templates)
            .leftJoin(parent, eq(templates.parentId, parent.id))
            .where(inArray(templates.id, body.templateIds))
        if (rows.length != body.templateIds.length) {
            return error(StatusCode.NOT_FOUND, "Not all templates found.")
        }
        if (rows.some(row => row.title === null)) {
            return error(StatusCode.BAD_REQUEST, "Cannot process root nodes.")
        }
        const orderedRows = body.templateIds.map(id => rows.find(row => row.id === id)).filter(row => row !== undefined)
        const file = await exportTemplates(orderedRows as TemplateParagraph[], body.replacements)
        return new Response(file as ArrayBuffer)
    } catch (e) {
        logger.error(e)
        return error(StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong.")
    }
}
