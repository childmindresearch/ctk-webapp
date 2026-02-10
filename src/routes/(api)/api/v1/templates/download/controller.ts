import { Html2Docx, NUMBERED_STYLE_BASE_REFERENCE } from "$lib/server/docx/html2docx"
import {
    AlignmentType,
    convertInchesToTwip,
    LevelFormat,
    Packer,
    UnderlineType,
    type INumberingOptions,
    type IParagraphStyleOptions
} from "docx"
import { parseHTML } from "linkedom"
import { DocxBuilderClient } from "$lib/docx/builder.js"

const LANGUAGETOOL_RULES = new Set([
    "BASE_FORM",
    "CONSECUTIVE_SPACES",
    "PERS_PRONOUN_AGREEMENT",
    "NON3PRS_VERB",
    "THE_US",
    "UPPERCASE_SENTENCE_START",
    "WEEK_HYPHEN"
])

const TITLE_LEVEL = 2
const PARAGRAPH_STYLES: IParagraphStyleOptions[] = [
    {
        id: "Normal",
        name: "Normal",
        next: "Normal",
        run: {
            font: "Cambria",
            size: 24 // Font size in Word seems to be size/2.
        }
    },
    {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: {
            underline: {
                type: UnderlineType.SINGLE
            }
        }
    }
]
const NUMBERING_STYLE: INumberingOptions["config"][number] = {
    reference: NUMBERED_STYLE_BASE_REFERENCE,
    levels: [
        {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) }
                }
            }
        },
        {
            level: 1,
            format: LevelFormat.LOWER_LETTER,
            text: "%2.",
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(0.5), hanging: convertInchesToTwip(0.25) }
                }
            }
        },
        {
            level: 2,
            format: LevelFormat.LOWER_ROMAN,
            text: "%3.",
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(0.75), hanging: convertInchesToTwip(0.25) }
                }
            }
        },
        {
            level: 3,
            format: LevelFormat.BULLET,
            text: "%4",
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(1), hanging: convertInchesToTwip(0.25) }
                }
            }
        }
    ]
}

/**
 * Creates the js-docx numbering styles.
 * We need a separate reference for each list.
 **/
function createNumberingStyles(nStyles: number): INumberingOptions {
    const config = Array.from({ length: nStyles + 1 }, (_, index) => ({
        ...NUMBERING_STYLE,
        reference: `${NUMBERING_STYLE.reference}-${index}`
    }))
    return { config }
}

export type TemplateParagraph = {
    title: string
    content: string
}

export async function exportTemplates(
    paragraphs: TemplateParagraph[],
    replacements: Record<string, string> = {}
): Promise<ArrayBuffer> {
    const htmls = paragraphs.map(n => `<h${TITLE_LEVEL}>${n.title}</h${TITLE_LEVEL}><p>${n.content}</p>`)
    const processedHtmls = htmls.map(html => replaceTemplates(html, replacements))
    const builder = new DocxBuilderClient()
    const convertor = new Html2Docx({ languageToolRules: LANGUAGETOOL_RULES })
    const numbering = createNumberingStyles(convertor.listCounter)
    const sections = processedHtmls.map(html => convertor.toSection(html))
    const doc = builder.document({
        sections,
        styles: {
            paragraphStyles: PARAGRAPH_STYLES
        },
        numbering
    })
    return Packer.toArrayBuffer(await doc)
}

export function replaceTemplates(html: string, replacements: Record<string, string>): string {
    const { document } = parseHTML(html)
    const templateSpans = document.querySelectorAll('span[data-extension-type="template"]')

    templateSpans.forEach(span => {
        const dataName = span.getAttribute("data-name")

        if (dataName && replacements[dataName]) {
            const newSpan = document.createElement("span")
            newSpan.textContent = replacements[dataName]
            span.replaceWith(newSpan)
        }
    })
    return document.toString()
}
