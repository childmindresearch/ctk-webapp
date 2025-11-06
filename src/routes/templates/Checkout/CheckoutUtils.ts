import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
import { HeadingLevel, Paragraph, SectionType, Table, type Document as DocxDocument, type ISectionOptions } from "docx"
import { DocxBuilderClient } from "$lib/docx/builder"
import { Html2Docx } from "$lib/docx/html2docx"
import sanitizeHtml from "sanitize-html"

export function getNodeTemplates(node: DecisionTree): TemplateName[] {
    const names = commands.templates.map(c => c.name)
    return names.filter(name => node.text.includes(`data-name="${name}"`))
}

export function exportRoot(node: DecisionTree): Promise<DocxDocument> {
    const builder = new DocxBuilderClient()
    return builder.document({
        sections: [
            {
                children: exportRootParagraphs(node)
            }
        ]
    })
}

export async function exportTemplates(
    nodes: DecisionTree[],
    replacements: Record<TemplateName, string>
): Promise<DocxDocument> {
    const nodesWithHeader = nodes.map(n => n.copy())
    nodesWithHeader.forEach(
        node => (node.text = `<p><i><u>${node.parent !== undefined ? node.parent.text : ""}</u></i>${node.text}</p>`)
    )
    const docs = nodesWithHeader.map(node => replaceTemplates(node, replacements))
    const builder = new DocxBuilderClient()
    const convertor = new Html2Docx({ useLanguageTool: true })
    const sectionContents = await Promise.all(docs.map(d => convertor.toSection(d)))
    const sections = sectionContents.map(s => {
        return {
            children: (s as ISectionOptions).children,
            properties: { type: SectionType.CONTINUOUS }
        }
    })
    return await builder.document({ sections })
}

/* Converts the paragraphs of a node and all its children. As paragraphs in HTML can contain tables, the output includes tables.
 */
async function exportRootParagraphs(node: DecisionTree, depth: number = 1): Promise<(Paragraph | Table)[]> {
    if (node.children.length === 0) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(node.text, "text/html")
        return await getParagraphs(doc)
    }
    const childParagraphs = (
        await Promise.all(node.children.map(child => exportRootParagraphs(child, depth + 1)))
    ).flat()

    return [
        new Paragraph({
            text: sanitizeHtml(node.text, { allowedTags: [] }),
            // @ts-expect-error type narrowing issue on heading.
            heading: HeadingLevel[`HEADING_${Math.min(depth, 6)}`]
        }),
        ...childParagraphs
    ]
}

async function getParagraphs(doc: Document): Promise<(Paragraph | Table)[]> {
    async function getParagraphNode(node: ChildNode): Promise<(Paragraph | Table)[]> {
        const nodeName = node.nodeName.toLowerCase()
        if (nodeName === "p" || (nodeName.length === 2 && nodeName.startsWith("h"))) {
            const converter = new Html2Docx({ useLanguageTool: false })
            return converter.toElements(node)
        }
        return (await Promise.all([...node.childNodes].map(getParagraphNode))).flat()
    }
    return (await Promise.all([...doc.childNodes].map(getParagraphNode))).flat()
}

function replaceTemplates(node: DecisionTree, replacements: Record<TemplateName, string>): Document {
    const parser = new DOMParser()
    const doc = parser.parseFromString(node.text, "text/html")
    const spans = doc.querySelectorAll('span[data-template=""]')

    spans.forEach(span => {
        const dataName = span.getAttribute("data-name") as TemplateName
        if (dataName && replacements[dataName]) {
            span.textContent = replacements[dataName]
        }
    })
    return doc
}
