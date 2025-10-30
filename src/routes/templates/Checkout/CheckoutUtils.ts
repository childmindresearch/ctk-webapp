import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
import type { Document as DocxDocument } from "docx"
import { DocxBuilder } from "$lib/docx/builder"
import { Html2DocxSection } from "$lib/docx/html2docx"

export function getNodeTemplates(node: DecisionTree): TemplateName[] {
    const names = commands.templates.map(c => c.name)
    return names.filter(name => node.text.includes(`data-name="${name}"`))
}

export async function nodes2Docx(
    nodes: DecisionTree[],
    replacements: Record<TemplateName, string>
): Promise<DocxDocument> {
    const docs = nodes.map(node => replaceTemplates(node, replacements))
    const builder = new DocxBuilder()
    const convertor = new Html2DocxSection({ useLanguageTool: true })
    const sections = docs.map(d => convertor.run(d))

    return await builder.document({ sections })
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
