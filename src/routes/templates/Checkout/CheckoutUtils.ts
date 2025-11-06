import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
import {
    HeadingLevel,
    Paragraph,
    SectionType,
    type Document as DocxDocument,
    type ISectionOptions,
    type IStylesOptions
} from "docx"
import { DocxBuilderClient } from "$lib/docx/builder"
import { Html2Docx } from "$lib/docx/html2docx"
import sanitizeHtml from "sanitize-html"

const BASE_STYLES: IStylesOptions = {
    paragraphStyles: [
        {
            id: "Normal",
            name: "Normal",
            next: "Normal",
            run: {
                font: "Times",
                size: 24 // Font size in Word seems to be size/2.
            }
        }
    ]
}
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
    return await builder.document({ sections, styles: BASE_STYLES })
}

function exportRootParagraphs(node: DecisionTree, depth: number = 1): Promise<Paragraph>[] {
    if (node.children.length === 0) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(node.text, "text/html")
        return getParagraphs(doc)
    }
    const builder = new DocxBuilderClient()
    return [
        builder.Paragraph({
            text: sanitizeHtml(node.text, { allowedTags: [] }),
            // @ts-expect-error type narrowing issue on heading.
            heading: HeadingLevel[`HEADING_${Math.min(depth, 6)}`]
        }),
        ...node.children.flatMap(child => exportRootParagraphs(child, depth + 1))
    ]
}

function getParagraphs(doc: Document): Promise<Paragraph>[] {
    function getParagraphNode(node: ChildNode): Promise<Paragraph>[] {
        const nodeName = node.nodeName.toLowerCase()
        console.log(nodeName)
        if (nodeName === "p" || (nodeName.length === 2 && nodeName.startsWith("h"))) {
            const convertor = new Html2Docx({ useLanguageTool: false })
            return convertor.toElements(node) as Promise<Paragraph>[]
        }
        return [...node.childNodes].flatMap(getParagraphNode)
    }
    return [...doc.childNodes].flatMap(getParagraphNode)
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
