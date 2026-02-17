import { Html2Docx, NUMBERED_STYLE_BASE_REFERENCE } from "$lib/server/docx/html2docx"
import {
    AlignmentType,
    convertInchesToTwip,
    LevelFormat,
    Packer,
    SectionType,
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
            format: LevelFormat.LOWER_LETTER, // format ignored as text makes no reference to it.
            text: "-",
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
 * Dataclass for the title and content of a template paragraph.
 **/
export type TemplateParagraph = {
    title: string
    content: string
}

/**
 * Exports templates to a .docx file.
 * @param paragraphs - The paragraphs to add to the Word document.
 * @param replacements - Replacements of variable values (e.g. pronouns).
 * @returns The .docx file.
 **/
export async function exportTemplates(
    paragraphs: TemplateParagraph[],
    replacements: Record<string, string> = {}
): Promise<ArrayBuffer> {
    const htmls = paragraphs.map(n => `<h${TITLE_LEVEL}>${n.title}</h${TITLE_LEVEL}><p>${n.content}</p>`)
    const processedHtmls = htmls.map(html => replaceTemplates(html, replacements))
    const builder = new DocxBuilderClient()
    const convertor = new Html2Docx({ languageToolRules: LANGUAGETOOL_RULES })
    const sections = processedHtmls.map(html => convertor.toSection(html, { type: SectionType.CONTINUOUS }))
    const numbering = convertor.createNumberingStyles(NUMBERING_STYLE)
    const doc = builder.document({
        sections,
        numbering,
        styles: {
            paragraphStyles: PARAGRAPH_STYLES
        }
    })
    return Packer.toArrayBuffer(await doc)
}

/**
 * Replaces template values with their string replacements.
 * The template texts contain spans for e.g. pronouns. This function is what does the actual
 * replacement. Target spans will have properties data-extension-type="template" and a
 * "data-name" indicating the name of the value to replace it with.
 * @param html - The HTML to replace templates in.
 * @param replacements - Record of the name (key) to replace with the value.
 * @returns HTML with templates replaced.
 **/
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
