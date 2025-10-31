import {
    type HeadingLevel,
    UnderlineType,
    type Table,
    type ISectionOptions,
    type Paragraph,
    type TextRun,
    type IRunStylePropertiesOptions
} from "docx"
import { DocxBuilder, NullComponent } from "./builder"

type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
}
type Match = {
    offset: number
    replacements?: { value: string }[]
    length: number
}
type Html2DocxOptions = {
    useLanguageTool: boolean
}
type TextSegment = { content: string; formatting: TextRunFormatting }
type TextRunFormatting = {
    bold?: boolean
    italics?: boolean
    underline?: {
        type?: (typeof UnderlineType)[keyof typeof UnderlineType]
        color?: string
    }
    color?: string
}

export class Html2DocxSection {
    private useLanguageTool: boolean

    constructor(options: Html2DocxOptions) {
        this.useLanguageTool = options.useLanguageTool
    }

    public run(doc: Document): Promise<ISectionOptions | NullComponent> {
        const builder = new DocxBuilder()
        return builder.section({ children: [...doc.childNodes].flatMap(child => this.processChildNode(child)) })
    }

    private processChildNode(docNode: ChildNode): Promise<NullComponent | Paragraph | Table>[] {
        const nodeName = docNode.nodeName.toLowerCase()
        switch (nodeName) {
            case "p":
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                return [this.processParagraph(docNode as HTMLParagraphElement)]
            case "table":
                return [this.processTable(docNode as HTMLTableElement)]
            case "ul":
            case "ol":
                return this.processList(docNode as HTMLUListElement | HTMLOListElement)
            default:
                return [...docNode.childNodes].flatMap(child => this.processChildNode(child))
        }
    }

    private async processParagraph(
        docNode: HTMLParagraphElement | HTMLHeadingElement
    ): Promise<Paragraph | NullComponent> {
        const nodeName = docNode.nodeName.toLowerCase()
        const builder = new DocxBuilder()
        const heading =
            nodeName !== "p"
                ? (`Heading${parseInt(nodeName[1])}` as (typeof HeadingLevel)[keyof typeof HeadingLevel])
                : undefined

        if (!this.useLanguageTool) {
            const textRuns = this.processInlineNodes(docNode.childNodes)
            return builder.Paragraph({ heading, children: textRuns })
        }

        const collector = new LanguageCorrectionCollector()
        this.collectInlineSegments(docNode.childNodes, collector)
        const correctedSegments = await collector.collect()

        const textRuns = correctedSegments.map(segment =>
            builder.TextRun({ text: segment.content, ...segment.formatting })
        )

        return builder.Paragraph({
            heading,
            children: textRuns
        })
    }

    private collectInlineSegments(
        docNodes: NodeListOf<ChildNode>,
        collector: LanguageCorrectionCollector,
        parentStyling: Mutable<IRunStylePropertiesOptions> = {}
    ): void {
        ;[...docNodes].forEach(node => {
            let thisStyle = structuredClone(parentStyling)
            const nodeName = node.nodeName.toLowerCase()

            switch (nodeName) {
                case "#text":
                    if (node.textContent) {
                        collector.push(node.textContent, thisStyle)
                    }
                    break

                case "strong":
                case "b":
                    thisStyle.bold = true
                    break

                case "em":
                case "i":
                    thisStyle.italics = true
                    break

                case "u":
                    thisStyle.underline = { type: UnderlineType.SINGLE }
                    break

                case "span": {
                    const span = node as HTMLSpanElement
                    const style = span.getAttribute("data-template") !== null ? undefined : span.style
                    thisStyle = {
                        ...thisStyle,
                        bold: style === undefined ? undefined : style.fontWeight === "bold",
                        italics: style === undefined ? undefined : style.fontStyle === "italic",
                        color: style === undefined ? undefined : this.extractColor(style.color)
                    }
                    break
                }
            }
            if (node.childNodes.length > 0) {
                this.collectInlineSegments(node.childNodes, collector, thisStyle)
            }
        })
    }

    private extractColor(color: string | undefined): string | undefined {
        if (!color) return undefined

        if (color.startsWith("#")) {
            return color.slice(1)
        }

        if (color.startsWith("rgb(")) {
            const [r, g, b] = color
                .slice(4, -1)
                .split(",")
                .map(s => Number(s.trim()))
            return this.rgbToHex(r, g, b).slice(1) // Remove leading #
        }

        return undefined
    }

    private processInlineNodes(
        docNodes: NodeListOf<ChildNode>,
        parentStyling: Mutable<IRunStylePropertiesOptions> = {}
    ): Promise<TextRun | NullComponent>[] {
        const textRuns: Promise<TextRun | NullComponent>[] = []
        const builder = new DocxBuilder()
        ;[...docNodes].forEach(node => {
            const nodeName = node.nodeName.toLowerCase()

            switch (nodeName) {
                case "#text":
                    if (node.textContent) {
                        textRuns.push(builder.TextRun({ text: node.textContent, ...parentStyling }))
                    }
                    break

                case "strong":
                case "b":
                    parentStyling["bold"] = true
                    break

                case "em":
                case "i":
                    parentStyling["italics"] = true
                    break

                case "u":
                    parentStyling.underline = { type: UnderlineType.SINGLE }
                    break

                case "span": {
                    const span = node as HTMLSpanElement
                    let style = span.style
                    if (span.getAttribute("data-template") !== null) {
                        // Don't use styling for templates.
                        style = new CSSStyleDeclaration()
                    }

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
                        color = this.rgbToHex(r, g, b)
                    }

                    parentStyling.bold = style.fontWeight === "bold"
                    parentStyling.italics = style.fontStyle === "italic"
                    parentStyling.color = color
                    break
                }

                case "br":
                    textRuns.push(builder.TextRun({ break: 1 }))
                    break
            }
            if (node.childNodes.length > 0) {
                textRuns.push(...this.processInlineNodes(node.childNodes, parentStyling))
            }
        })
        return textRuns
    }
    private processTable(node: HTMLTableElement): Promise<Table | NullComponent> {
        const builder = new DocxBuilder()
        const rows = [...node.querySelectorAll("tr")].map(tr => {
            const cells = [...tr.querySelectorAll("td, th")].map(cell => {
                return builder.TableCell({
                    children: [
                        builder.Paragraph({
                            children: this.processInlineNodes(cell.childNodes)
                        })
                    ]
                })
            })

            return builder.TableRow({ children: cells })
        })

        return builder.Table({ rows })
    }

    private processList(node: HTMLUListElement | HTMLOListElement): Promise<Paragraph | NullComponent>[] {
        const builder = new DocxBuilder()
        const isOrdered = node.nodeName.toLowerCase() === "ol"

        return [...node.querySelectorAll("li")].map(li => {
            return builder.Paragraph({
                bullet: isOrdered ? undefined : { level: 0 },
                numbering: isOrdered ? { reference: "default", level: 0 } : undefined,
                children: this.processInlineNodes(li.childNodes)
            })
        })
    }

    private rgbToHex(r: number, g: number, b: number): string {
        const toHex = (n: number): string => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
            return hex.length === 1 ? "0" + hex : hex
        }
        return "#" + toHex(r) + toHex(g) + toHex(b)
    }
}

class LanguageCorrectionCollector {
    private segments: TextSegment[] = []

    public push(content: string, formatting: TextRunFormatting): void {
        this.segments.push({ content, formatting })
    }

    public async collect(): Promise<TextSegment[]> {
        if (this.segments.length === 0) return []

        const text = this.segments.map(c => c.content).join("")
        const corrections = await this.languageTool(text)
        console.log(corrections)
        return this.applyCorrections(corrections)
    }

    private applyCorrections(corrections: Match[]): TextSegment[] {
        const sortedCorrections = [...corrections]
        sortedCorrections.sort((a, b) => b.offset - a.offset)
        const segments = [...this.segments]
        const offsets = segments
            .map(s => s.content)
            .reduce((acc, value, index) => {
                if (acc.length === 0) return [0]
                return [...acc, (acc.at(-1) as number) + segments[index - 1].content.length]
            }, [] as number[])

        sortedCorrections.forEach(corr => {
            if (corr.replacements === undefined || corr.replacements.length === 0) return
            const startRunIndex = offsets.findLastIndex(offset => offset <= corr.offset)
            let endRunIndex = offsets.findLastIndex(offset => offset < corr.offset + corr.length)
            if (endRunIndex === -1) endRunIndex = offsets.length - 1

            segments[startRunIndex].content =
                segments[startRunIndex].content.slice(0, corr.offset - offsets[startRunIndex]) +
                corr.replacements[0].value +
                segments[startRunIndex].content.slice(corr.offset + corr.length - offsets[startRunIndex])

            let currIndex = startRunIndex + 1
            while (currIndex < endRunIndex + 1) {
                segments[currIndex].content = segments[currIndex].content.slice(
                    corr.offset + corr.length - offsets[currIndex]
                )
                currIndex++
            }
        })
        return segments
    }

    private async languageTool(text: string): Promise<Match[]> {
        try {
            const resp = await fetch("/api/language-tool", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            })

            if (!resp.ok) {
                throw new Error(`HTTP error: status: ${resp.status}`)
            }

            return (await resp.json())["matches"]
        } catch (error) {
            console.error("LanguageTool error:", error)
            throw new Error("LanguageTool failed.")
        }
    }
}
