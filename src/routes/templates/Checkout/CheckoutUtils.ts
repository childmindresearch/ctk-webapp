import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
import { SectionType, type Document as DocxDocument, type ISectionOptions, type IStylesOptions } from "docx"
import { DocxBuilder, NullComponent } from "$lib/docx/builder"
import { Html2DocxSection } from "$lib/docx/html2docx"

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

export async function nodes2Docx(
    nodes: DecisionTree[],
    replacements: Record<TemplateName, string>
): Promise<DocxDocument> {
    const nodesWithHeader = nodes.map(n => n.copy())
    nodesWithHeader.forEach(
        node => (node.text = `<p><u><i>${node.parent !== undefined ? node.parent.text : ""}</i></u>${node.text}</p>`)
    )
    const docs = nodesWithHeader.map(node => replaceTemplates(node, replacements))
    const builder = new DocxBuilder()
    const convertor = new Html2DocxSection({ useLanguageTool: true })
    const sectionContents = await Promise.all(docs.map(d => convertor.run(d)))
    const sections = sectionContents
        .filter(s => !(s instanceof NullComponent))
        .map(s => {
            return {
                children: (s as ISectionOptions).children,
                properties: { type: SectionType.CONTINUOUS }
            }
        })
    return await builder.document({ sections, styles: BASE_STYLES })
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
