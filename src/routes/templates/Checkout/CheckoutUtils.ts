import type { DecisionTree } from "../DecisionTree.svelte"
import commands, { type TemplateName } from "$lib/components/edra/commands/toolbar-commands"
import type { Document as DocxDocument, ISectionOptions, Paragraph, Table, TextRun } from "docx"
import { DocxBuilder, NullComponent } from "$lib/docx/builder"

export function getNodeTemplates(node: DecisionTree): TemplateName[] {
    const names = commands.templates.map(c => c.name)
    return names.filter(name => node.text.includes(`data-name="${name}"`))
}

async function languageTool(text: string): Promise<string> {
    if (text.trim().length === 0) return text
    try {
        const resp = await fetch("/api/language-tool", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        })

        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`)
        }

        return (await resp.json())["corrected"]
    } catch (error) {
        console.error("LanguageTool error:", error)
        return "[ERROR: LanguageTool failed]"
    }
}

export async function nodes2Docx(
    nodes: DecisionTree[],
    replacements: Record<TemplateName, string>
): Promise<DocxDocument> {
    const docs = nodes.map(node => replaceTemplates(node, replacements))
    const builder = new DocxBuilder()

    return await builder.document({ sections: docs.map(doc2Section) })
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

function doc2Section(doc: Document | ChildNode): Promise<ISectionOptions | NullComponent> {
    const builder = new DocxBuilder()
    return builder.section({ children: [...doc.childNodes].flatMap(processChildNode) })
}

function processChildNode(docNode: ChildNode): Promise<NullComponent | Paragraph | Table>[] {
    const nodeName = docNode.nodeName.toLowerCase()
    switch (nodeName) {
        case "p":
        case "h1":
        case "h2":
        case "h3":
        case "h4":
        case "h5":
        case "h6":
            return [processParagraph(docNode as HTMLParagraphElement)]
        case "table":
            return [processTable(docNode as HTMLTableElement)]
        case "ul":
        case "ol":
            return processList(docNode as HTMLUListElement | HTMLOListElement)
        default:
            return [...docNode.childNodes].flatMap(processChildNode)
    }
}

function processParagraph(docNode: HTMLParagraphElement | HTMLHeadingElement): Promise<Paragraph | NullComponent> {
    const nodeName = docNode.nodeName.toLowerCase()
    const builder = new DocxBuilder()
    let heading = undefined
    if (nodeName !== "p") heading = `Heading${parseInt(nodeName[1])}`
    return builder.Paragraph({
        children: processInlineNodes(docNode.childNodes),
        // @ts-expect-error Heading string typing
        heading
    })
}

function processInlineNodes(docNodes: NodeListOf<ChildNode>): Promise<TextRun | NullComponent>[] {
    const textRuns: Promise<TextRun | NullComponent>[] = []
    const builder = new DocxBuilder()
    ;[...docNodes].forEach(node => {
        const nodeName = node.nodeName.toLowerCase()

        switch (nodeName) {
            case "#text":
                if (node.textContent) {
                    textRuns.push(builder.TextRun(languageTool(node.textContent)))
                }
                break

            case "strong":
            case "b":
                textRuns.push(
                    builder.TextRun({
                        text: languageTool(node.textContent || ""),
                        bold: true
                    })
                )
                break

            case "em":
            case "i":
                textRuns.push(
                    builder.TextRun({
                        text: languageTool(node.textContent || ""),
                        italics: true
                    })
                )
                break

            case "u":
                textRuns.push(
                    builder.TextRun({
                        text: languageTool(node.textContent || ""),
                        underline: {}
                    })
                )
                break

            case "span": {
                const span = node as HTMLSpanElement
                const style = span.style

                let color: string | undefined = undefined
                if (style.color !== undefined) {
                    if (style.color.startsWith("#")) {
                        color = style.color.slice(1)
                    }
                    // Assume RGB code in the form `rgb(R, G, B)`.
                    const [r, g, b] = style.color
                        .slice(4, -1)
                        .split(",")
                        .map(s => s.trim())
                        .map(Number)
                    color = rgbToHex(r, g, b)
                }

                textRuns.push(
                    builder.TextRun({
                        text: languageTool(node.textContent || ""),
                        bold: style.fontWeight === "bold",
                        italics: style.fontStyle === "italic",
                        color
                    })
                )
                break
            }

            case "br":
                textRuns.push(builder.TextRun({ break: 1 }))
                break

            default:
                if (node.childNodes.length > 0) {
                    textRuns.push(...processInlineNodes(node.childNodes))
                }
                break
        }
    })
    return textRuns
}
function processTable(node: HTMLTableElement): Promise<Table | NullComponent> {
    const builder = new DocxBuilder()
    const rows = [...node.querySelectorAll("tr")].map(tr => {
        const cells = [...tr.querySelectorAll("td, th")].map(cell => {
            return builder.TableCell({
                children: [
                    builder.Paragraph({
                        children: processInlineNodes(cell.childNodes)
                    })
                ]
            })
        })

        return builder.TableRow({ children: cells })
    })

    return builder.Table({ rows })
}

function processList(node: HTMLUListElement | HTMLOListElement): Promise<Paragraph | NullComponent>[] {
    const builder = new DocxBuilder()
    const isOrdered = node.nodeName.toLowerCase() === "ol"

    return [...node.querySelectorAll("li")].map(li => {
        return builder.Paragraph({
            bullet: isOrdered ? undefined : { level: 0 },
            numbering: isOrdered ? { reference: "default", level: 0 } : undefined,
            children: processInlineNodes(li.childNodes)
        })
    })
}

function rgbToHex(r: number, g: number, b: number) {
    const toHex = (n: number): string => {
        const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
        return hex.length === 1 ? "0" + hex : hex
    }
    return "#" + toHex(r) + toHex(g) + toHex(b)
}
