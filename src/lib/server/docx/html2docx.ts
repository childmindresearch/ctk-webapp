import {
    Paragraph,
    Table,
    type HeadingLevel,
    UnderlineType,
    type ISectionOptions,
    type IRunStylePropertiesOptions,
    TextRun,
    TableCell,
    TableRow
} from "docx"
import { DocxBuilderClient } from "../../docx/builder"
import { languageTool, type LanguageToolResponseSchema } from "../languageTool"
import { DOMParser } from "linkedom"
import type z from "zod"
import AdmZip from "adm-zip"

type Mutable<T> = {
    -readonly [P in keyof T]: T[P]
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

const NUMBERED_LIST_STYLE_REFERENCE = "custom-list"

function isTextSegment(obj: object): obj is TextSegment {
    try {
        return Object.hasOwn(obj, "content") && Object.hasOwn(obj, "formatting")
    } catch {
        return false
    }
}

function isTextSegmentArray(arr: object[]): arr is TextSegment[] {
    return arr.every(isTextSegment)
}

const LANGUAGETOOL_RULES = [
    "BASE_FORM",
    "CONSECUTIVE_SPACES",
    "PERS_PRONOUN_AGREEMENT",
    "NON3PRS_VERB",
    "THE_US",
    "UPPERCASE_SENTENCE_START",
    "WEEK_HYPHEN"
]

export class Html2Docx {
    private useLanguageTool: boolean
    private listCounter: number

    constructor(options: Html2DocxOptions) {
        this.useLanguageTool = options.useLanguageTool
        this.listCounter = 1
    }

    public toSection(html: string): Promise<ISectionOptions> {
        const builder = new DocxBuilderClient()
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, "text/html")
        return builder.section({ children: [...doc.childNodes].flatMap(child => this.toElements(child)) })
    }

    public async toElements(docNode: ChildNode): Promise<(Paragraph | Table)[]> {
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
                return this.processList(docNode as HTMLUListElement | HTMLOListElement)
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

            let corrected: TextSegment[] = fragment
            if (this.useLanguageTool) {
                const collector = new LanguageCorrectionCollector()
                collector.push(...fragment)
                corrected = await collector.collect()
            }

            const textRuns = corrected.map(
                segment =>
                    new TextRun({
                        text: (segment as TextSegment).content,
                        ...(segment as TextSegment).formatting
                    })
            )

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
            return this.rgbToHex(r, g, b).slice(1) // Remove leading #
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

    private processList(node: HTMLUListElement | HTMLOListElement, level: number = 0): Paragraph[] {
        const isOrdered = node.nodeName.toLowerCase() === "ol"
        if (level === 0) this.listCounter++
        return [...node.children].flatMap(li => {
            if (li.nodeName.toLowerCase() === "li") {
                return this.processListItem(li as HTMLLIElement, level, isOrdered)
            }
            return []
        })
    }

    private processListItem(li: HTMLLIElement, level: number, isOrdered: boolean): Paragraph[] {
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
                bullet: isOrdered ? undefined : { level },
                numbering: isOrdered
                    ? { reference: `${NUMBERED_LIST_STYLE_REFERENCE}-${this.listCounter}`, level }
                    : undefined,
                children: textRuns
            })
        )

        nestedLists.forEach(nestedList => {
            paragraphs.push(...this.processList(nestedList, level + 1))
        })

        return paragraphs
    }

    private rgbToHex(r: number, g: number, b: number): string {
        const toHex = (n: number): string => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16)
            return hex.length === 1 ? "0" + hex : hex
        }
        return "#" + toHex(r) + toHex(g) + toHex(b)
    }

    /*
     * Fixes invalid numbering list identifiers in a DOCX document to work around a js-docx patching bug.
     *
     * **Problem:** js-docx has a known issue when patching documents into which we've inserted numbered lists,
     * where it inserts invalid numId values in the format `{STYLE_REF-0}` instead of plain
     * numeric IDs. These invalid values cause Word to fail rendering the numbered lists correctly.
     *
     * **Solution:** This function extracts the document XML, finds all malformed numbered list
     * references that match our custom style pattern, extracts the numeric portion, and ensures the
     * new reference is unique.
     *
     * @see {@link https://github.com/dolanmiu/docx/issues/2088}
     *
     * @param arrayBuffer - The raw binary data of the .docx file to be modified
     *
     * @returns A new ArrayBufferLike containing the modified .docx file with valid numId values.
     */
    public static fixNumericListNumId(arrayBuffer: ArrayBuffer): ArrayBufferLike {
        const zip = new AdmZip(Buffer.from(arrayBuffer))
        const numberingXml = zip.readAsText("word/numbering.xml")
        let documentXml = zip.readAsText("word/document.xml")

        const numIdPattern = /<w:num w:numId="(\d+)"/g
        let maxNumId = 0
        let match

        while ((match = numIdPattern.exec(numberingXml)) !== null) {
            maxNumId = Math.max(maxNumId, parseInt(match[1]))
        }

        const pattern = new RegExp(`<w:numId w:val="\\{${NUMBERED_LIST_STYLE_REFERENCE}-(\\d+)-0\\}"\\/>`, "g")
        documentXml = documentXml.replace(pattern, (_, num) => {
            const newNumId = maxNumId + parseInt(num)
            return `<w:numId w:val="${newNumId}"/>`
        })

        zip.updateFile("word/document.xml", Buffer.from(documentXml, "utf8"))
        return zip.toBuffer().buffer
    }
}

class LanguageCorrectionCollector {
    private segments: TextSegment[] = []

    public push(...segments: TextSegment[]): void {
        this.segments.push(...segments)
    }

    public async collect(): Promise<TextSegment[]> {
        if (this.segments.length === 0) return []
        const text = this.segments.map(c => c.content).join("")
        const matches = (await languageTool(text)).matches
        const corrections = matches.filter(match => LANGUAGETOOL_RULES.includes(match.rule.id))
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
