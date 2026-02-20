import {
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    UnderlineType,
    type HeadingLevel,
    type INumberingOptions,
    type IRunStylePropertiesOptions,
    type ISectionOptions
} from "docx"
import { DOMParser } from "linkedom"
import type z from "zod"
import { DocxBuilderClient } from "../../docx/builder"
import { languageTool, type LanguageToolResponseSchema } from "$lib/server/languageTool"

type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
}

type Html2DocxOptions = {
    languageToolRules: Set<string>
}
export type TextSegment = { content: string; formatting: TextRunFormatting }
type TextRunFormatting = {
    bold?: boolean
    italics?: boolean
    underline?: {
        type?: (typeof UnderlineType)[keyof typeof UnderlineType]
        color?: string
    }
    color?: string
}

export const NUMBERED_STYLE_BASE_REFERENCE = "custom-numbered-list"
export const BULLET_STYLE_BASE_REFERENCE = "custom-bullet-list"

export function isTextSegment(obj: object): obj is TextSegment {
    try {
        return Object.hasOwn(obj, "content") && Object.hasOwn(obj, "formatting")
    } catch {
        return false
    }
}

export function isTextSegmentArray(arr: object[]): arr is TextSegment[] {
    return arr.every(isTextSegment)
}

export class Html2Docx {
    private languageToolRules: Set<string> | undefined
    private numberedListCounter: number
    private bulletListCounter: number

    /**
     * Constructs the HTML2Docx object.
     * Be aware that this object is stateful; i.e. a new one should be
     * constructed for each document.
     **/
    constructor(options: Html2DocxOptions) {
        this.languageToolRules = options.languageToolRules
        this.numberedListCounter = 0
        this.bulletListCounter = 0
    }
    /**
     * Creates the js-docx numbering styles.
     * We need a separate reference for each list, otherwise
     * lists will continue from the prior list's number.
     * @param style - The style to apply to all numbered lists.
     **/
    public createListStyles(
        numberedStyle: INumberingOptions["config"][number],
        bulletStyle: INumberingOptions["config"][number]
    ): INumberingOptions {
        const numberedConfig = Array.from({ length: this.numberedListCounter + 1 }, (_, index) => ({
            ...numberedStyle,
            reference: `${NUMBERED_STYLE_BASE_REFERENCE}-${index}`
        }))
        const bulletConfig = Array.from({ length: this.bulletListCounter + 1 }, (_, index) => ({
            ...bulletStyle,
            reference: `${BULLET_STYLE_BASE_REFERENCE}-${index}`
        }))
        return { config: [...numberedConfig, ...bulletConfig] }
    }

    public async toParagraphs(html: string): Promise<(Paragraph | Table)[]> {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")
        const paragraphs = await Promise.all([...doc.childNodes].flatMap(child => this.toElements(child)))
        return paragraphs.flat()
    }

    private async toElements(docNode: ChildNode): Promise<(Paragraph | Table)[]> {
        const nodeName = docNode.nodeName.toLowerCase()
        switch (nodeName) {
            case "p":
            case "h1":
            case "h2":
            case "h3":
            case "h4":
            case "h5":
            case "h6":
                return this.processParagraph(docNode as HTMLParagraphElement)
            case "table":
                return [this.processTable(docNode as HTMLTableElement)]
            case "ul":
            case "ol":
                return this.processList(docNode as HTMLUListElement | HTMLOListElement, 0)
            case "br":
                return [await new DocxBuilderClient().Paragraph("")]
            default:
                return (await Promise.all([...docNode.childNodes].map(child => this.toElements(child)))).flat()
        }
    }

    /*
     * Processes paragraph and heading elements. As HTML allows for nesting of lists and tables inside paragraphs
     * but Word expects them as separate paragraphs and Paragraphs are the unit where we have to run (async)
     * LanguageTool, this function gets a bit messy.
     */
    private async processParagraph(docNode: HTMLParagraphElement | HTMLHeadingElement): Promise<(Paragraph | Table)[]> {
        const nodeName = docNode.nodeName.toLowerCase()
        const heading =
            nodeName !== "p"
                ? (`Heading${parseInt(nodeName[1])}` as (typeof HeadingLevel)[keyof typeof HeadingLevel])
                : undefined

        const fragments = await Promise.all(
            [...docNode.childNodes].map(child => {
                const nodeName = child.nodeName.toLowerCase()
                if (["ul", "ol", "p", "h1", "h2", "h3", "h4", "h5", "h6", "table"].includes(nodeName)) {
                    return this.toElements(child)
                }
                return this.extractInlineSegments([child])
            })
        )

        const reducedFragments = fragments.reduce(
            (acc, curr) => {
                if (curr.length === 0) return acc
                if (acc.length > 0 && isTextSegment(acc[acc.length - 1][0]) && isTextSegment(curr[0])) {
                    // @ts-expect-error type errors covered by above if-statement.
                    acc[acc.length - 1].push(...curr)
                    return acc
                }
                acc.push(curr)
                return acc
            },
            [] as (Paragraph[] | Table[] | TextSegment[])[]
        )

        const paragraphs: (Paragraph[] | Table[])[] = []
        const builder = new DocxBuilderClient()
        for (let index = 0; index < reducedFragments.length; index++) {
            const fragment = reducedFragments[index]
            if (!isTextSegmentArray(fragment)) {
                paragraphs.push(fragment)
                continue
            }

            let textRuns: Promise<TextRun[]> | TextRun[]
            if (this.languageToolRules !== undefined) {
                const collector = new LanguageCorrectionCollector(this.languageToolRules)
                collector.push(...fragment)
                textRuns = collector
                    .collect()
                    .then(runs => runs.map(segment => new TextRun({ text: segment.content, ...segment.formatting })))
            } else {
                textRuns = fragment.map(
                    segment =>
                        new TextRun({
                            text: (segment as TextSegment).content,
                            ...(segment as TextSegment).formatting
                        })
                )
            }

            paragraphs.push([
                await builder.Paragraph({
                    heading,
                    children: textRuns
                })
            ])
        }

        return paragraphs.flat()
    }

    private extractInlineSegments(
        docNodes: NodeListOf<ChildNode> | ChildNode[],
        parentStyling: Mutable<IRunStylePropertiesOptions> = {}
    ): TextSegment[] {
        const segments: TextSegment[] = []

        ;[...docNodes].forEach(node => {
            let thisStyle = structuredClone(parentStyling)
            const nodeName = node.nodeName.toLowerCase()

            switch (nodeName) {
                case "#text":
                    if (node.textContent) {
                        segments.push({
                            content: node.textContent,
                            formatting: thisStyle
                        })
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
                    const isTemplate = span.getAttribute("data-template") !== null
                    const style = isTemplate ? undefined : span.style

                    thisStyle = {
                        ...thisStyle,
                        bold: style?.fontWeight === "bold" || thisStyle.bold,
                        italics: style?.fontStyle === "italic" || thisStyle.italics,
                        color: style ? this.extractColor(style.color) : thisStyle.color
                    }
                    break
                }
                case "br":
                    segments.push({
                        content: "\n",
                        formatting: { ...thisStyle }
                    })
                    break
            }

            if (node.childNodes.length > 0) {
                segments.push(...this.extractInlineSegments(node.childNodes, thisStyle))
            }
        })

        return segments
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
            return rgbToHex(r, g, b).slice(1) // Remove leading #
        }
        return undefined
    }

    private processTable(node: HTMLTableElement): Table {
        const rows = [...node.querySelectorAll("tr")].map(tr => {
            const cells = [...tr.querySelectorAll("td, th")].map(cell => {
                const segments = this.extractInlineSegments(cell.childNodes)
                const textRuns = segments.map(segment => new TextRun({ text: segment.content, ...segment.formatting }))
                return new TableCell({
                    children: [
                        new Paragraph({
                            children: textRuns
                        })
                    ]
                })
            })
            return new TableRow({ children: cells })
        })
        return new Table({ rows })
    }

    private processList(
        node: HTMLUListElement | HTMLOListElement,
        level: number,
        parentList: HTMLUListElement | HTMLOListElement | undefined = undefined
    ): Paragraph[] {
        const isOrdered = node.nodeName.toLowerCase() === "ol"
        if (level === 0 && isOrdered) this.numberedListCounter++
        if (level === 0 && !isOrdered) this.bulletListCounter++

        if (parentList !== undefined && parentList.nodeName.toLowerCase() !== node.nodeName.toLowerCase()) {
            // If list type changes mid-list, increment counter.
            if (isOrdered) {
                this.numberedListCounter++
            } else {
                this.bulletListCounter++
            }
        }

        return [...node.children].flatMap(li => {
            if (li.nodeName.toLowerCase() === "li") {
                return this.processListItem(node, li as HTMLLIElement, level, isOrdered)
            }
            return []
        })
    }

    private processListItem(
        node: HTMLUListElement | HTMLOListElement,
        li: HTMLLIElement,
        level: number,
        isOrdered: boolean
    ): Paragraph[] {
        const paragraphs: Paragraph[] = []
        const contentNodes: ChildNode[] = []
        const nestedLists: (HTMLUListElement | HTMLOListElement)[] = []

        li.childNodes.forEach(child => {
            const nodeName = child.nodeName.toLowerCase()
            if (["ul", "ol"].includes(nodeName)) {
                nestedLists.push(child as HTMLUListElement | HTMLOListElement)
            } else {
                contentNodes.push(child)
            }
        })

        const segments = this.extractInlineSegments(contentNodes)
        const textRuns = segments.map(segment => new TextRun({ text: segment.content, ...segment.formatting }))
        paragraphs.push(
            new Paragraph({
                numbering: isOrdered
                    ? { reference: `${NUMBERED_STYLE_BASE_REFERENCE}-${this.numberedListCounter}`, level }
                    : { reference: `${BULLET_STYLE_BASE_REFERENCE}-${this.bulletListCounter}`, level },
                children: textRuns
            })
        )

        nestedLists.forEach(nestedList => {
            paragraphs.push(...this.processList(nestedList, level + 1, node))
        })

        return paragraphs
    }
}

export class LanguageCorrectionCollector {
    private segments: TextSegment[] = []
    readonly rules: Set<string>

    constructor(rules: Set<string>) {
        this.rules = rules
    }

    public push(...segments: TextSegment[]): void {
        this.segments.push(...segments)
    }

    public async collect(): Promise<TextSegment[]> {
        if (this.segments.length === 0) return []
        const text = this.segments.map(c => c.content).join("")
        const matches = (await languageTool(text)).matches
        const corrections = matches.filter(match => this.rules.has(match.rule.id))
        return this.applyCorrections(corrections)
    }

    private applyCorrections(matches: z.infer<typeof LanguageToolResponseSchema>["matches"]): TextSegment[] {
        matches.sort((a, b) => b.offset - a.offset)
        const segments = [...this.segments]
        const offsets = segments
            .map(s => s.content)
            .reduce((acc, value, index) => {
                if (acc.length === 0) return [0]
                return [...acc, (acc.at(-1) as number) + segments[index - 1].content.length]
            }, [] as number[])
        matches.forEach(corr => {
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
}

export function rgbToHex(r: number, g: number, b: number): string {
    return "#" + toHex(r) + toHex(g) + toHex(b)
}

export function toHex(n: number): string {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
    return hex.length === 1 ? "0" + hex : hex
}
