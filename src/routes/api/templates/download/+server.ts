import AdmZip from "adm-zip"
import { logger } from "$lib/server/logging"
import { PatchType } from "docx"
import { Html2Docx } from "$lib/server/docx/html2docx"
import { error } from "@sveltejs/kit"
import { DocxBuilderServer, fixNumId } from "$lib/server/docx/builder"
import { db } from "$lib/server/db"
import { templates } from "$lib/server/db/schema"
import { inArray, eq } from "drizzle-orm"
import { alias } from "drizzle-orm/pg-core"
import { StatusCode } from "$lib/utils"
import { TemplatesDownloadPOSTSchema } from "./schemas"
import fs from "fs"
import path from "path"

const TITLE_LEVEL = 2
const DOCX_TEMPLATE = fs.readFileSync(path.join(process.cwd(), "src/lib/server/docx/patches/templates.docx"))

type TemplateParagraph = {
    title: string
    content: string
}

export async function POST({ request }) {
    logger.info("Downloading templates as docx")
    try {
        const json = await request.json()
        const body = TemplatesDownloadPOSTSchema.parse(json)
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
        const file = await exportTemplates(rows as TemplateParagraph[], body.replacements)
        return new Response(file)
    } catch (e) {
        logger.error(e)
        return error(StatusCode.INTERNAL_SERVER_ERROR, "Something went wrong.")
    }
}

async function exportTemplates(
    paragraphs: TemplateParagraph[],
    replacements: Record<string, string> = {}
): Promise<ArrayBuffer> {
    const htmls = paragraphs.map(n => `<h${TITLE_LEVEL}>${n.title}</h${TITLE_LEVEL}><p>${n.content}</p>`)
    const processedHtmls = htmls.map(html => replaceTemplates(html, replacements))
    const builder = new DocxBuilderServer()
    const convertor = new Html2Docx({ useLanguageTool: true })
    const sectionContents = await Promise.all(processedHtmls.map(html => convertor.toSection(html)))
    const children = sectionContents.flatMap(s => {
        return s.children
    })
    const doc = (await builder.patchDocument({
        data: DOCX_TEMPLATE,
        outputType: "arraybuffer",
        patches: {
            content: {
                type: PatchType.DOCUMENT,
                children: children
            }
        }
    })) as ArrayBuffer
    return fixNumId(doc, 46)
}

function replaceTemplates(html: string, replacements: Record<string, string>): string {
    let result = html

    // Pattern: <span data-template="" data-name="TEMPLATE_NAME">content</span>
    const spanRegex = /<span[^>]*data-template=""[^>]*data-name="([^"]*)"[^>]*>([^<]*)<\/span>/g
    result = result.replace(spanRegex, (match, dataName, content) => {
        if (dataName && replacements[dataName]) {
            return match.replace(content, replacements[dataName])
        }
        return match
    })

    return result
}
