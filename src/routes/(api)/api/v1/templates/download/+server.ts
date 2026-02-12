import { db } from "$lib/server/db"
import { templates } from "$lib/server/db/schema"
import { DocxBuilderServer } from "$lib/server/docx/builder"
import { Html2Docx } from "$lib/server/docx/html2docx"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils"
import { error } from "@sveltejs/kit"
import { PatchType } from "docx"
import { eq, inArray } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import fs from "fs"
import { parseHTML } from "linkedom"
import path from "path"
import { postTemplateDownloadSchema } from "./index.js"
import { getRequestEvent } from "$app/server"

const TITLE_LEVEL = 2

function getDocxTemplate() {
    const devPath = path.join(process.cwd(), "static", "templates.docx")
    const prodPath = path.join(process.cwd(), "build", "client", "templates.docx")

    if (fs.existsSync(devPath)) {
        return fs.readFileSync(devPath)
    } else {
        return fs.readFileSync(prodPath)
    }
}

type TemplateParagraph = {
    title: string
    content: string
}

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
        const orderedRows = body.templateIds
            .map(id => rows.find(row => row.id === id))
            .filter(row => row !== undefined)
        
        if (orderedRows.length != body.templateIds.length) {
            return error(StatusCode.NOT_FOUND, "Not all templates found.")
        }
        if (orderedRows.some(row => row.title === null)) {
            return error(StatusCode.BAD_REQUEST, "Cannot process root nodes.")
        }
        const file = await exportTemplates(orderedRows as TemplateParagraph[], body.replacements)
        return new Response(file as ArrayBuffer)
    } catch (e) {
        logger.error(e)
        return error(StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong.")
    }
}

async function exportTemplates(
    paragraphs: TemplateParagraph[],
    replacements: Record<string, string> = {}
): Promise<ArrayBufferLike> {
    const htmls = paragraphs.map(n => `<h${TITLE_LEVEL}>${n.title}</h${TITLE_LEVEL}><p>${n.content}</p>`)
    const processedHtmls = htmls.map(html => replaceTemplates(html, replacements))
    const builder = new DocxBuilderServer()
    const convertor = new Html2Docx({ useLanguageTool: true })
    const sectionContents = await Promise.all(processedHtmls.map(html => convertor.toSection(html)))
    const children = sectionContents.flatMap(s => {
        return s.children
    })
    const doc = (await builder.patchDocument({
        data: getDocxTemplate(),
        outputType: "arraybuffer",
        patches: {
            content: {
                type: PatchType.DOCUMENT,
                children: children
            }
        }
    })) as ArrayBuffer
    return Html2Docx.fixNumericListNumId(doc)
}

function replaceTemplates(html: string, replacements: Record<string, string>): string {
    const { document } = parseHTML(html)
    const templateSpans = document.querySelectorAll('span[data-extension-type="template"]')

    templateSpans.forEach(span => {
        const dataName = span.getAttribute("data-name")

        if (dataName && replacements[dataName]) {
            const newSpan = document.createElement("span")
            newSpan.textContent = replacements[dataName]
            span.replaceWith(newSpan)
        }
    })
    return document.toString()
}
