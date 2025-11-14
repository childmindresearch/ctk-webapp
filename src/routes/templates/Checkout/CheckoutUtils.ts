import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"

export function getNodeTemplates(node: DecisionTree): TemplateName[] {
    const names = commands.templates.map(c => c.name)
    return names.filter(name => node.text.includes(`data-name="${name}"`))
}

/*
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
*/
