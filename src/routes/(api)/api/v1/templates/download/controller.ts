import { BULLET_STYLE_BASE_REFERENCE, Html2Docx, NUMBERED_STYLE_BASE_REFERENCE } from "$lib/server/docx/html2docx"
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

const PARAGRAPH_STYLES: IParagraphStyleOptions[] = [
    {
        id: "Normal",
        name: "Normal",
        next: "Normal",
        run: {
            font: "Cambria",
            size: 24 // Font size in Word seems to be size/2.
        }
    }
]
const LIST_LEFT = 0.25
const LIST_HANGING = 0.25
const NUMBERED_LIST_STYLES: INumberingOptions["config"][number] = {
    reference: NUMBERED_STYLE_BASE_REFERENCE,
    levels: [
        {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(LIST_LEFT), hanging: convertInchesToTwip(LIST_HANGING) }
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
                    indent: { left: convertInchesToTwip(LIST_LEFT * 2), hanging: convertInchesToTwip(LIST_HANGING) }
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
                    indent: { left: convertInchesToTwip(LIST_LEFT * 3), hanging: convertInchesToTwip(LIST_HANGING) }
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
                    indent: { left: convertInchesToTwip(LIST_LEFT * 4), hanging: convertInchesToTwip(LIST_HANGING) }
                }
            }
        }
    ]
}
const BULLET_LIST_STYLES: INumberingOptions["config"][number] = {
    reference: BULLET_STYLE_BASE_REFERENCE,
    levels: [
        {
            level: 0,
            format: LevelFormat.BULLET,
            text: "\u2022", // bullet
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(LIST_LEFT), hanging: convertInchesToTwip(LIST_HANGING) }
                }
            }
        },
        {
            level: 1,
            format: LevelFormat.BULLET,
            text: "\u25E6", // hollow bullet
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(LIST_LEFT * 2), hanging: convertInchesToTwip(LIST_HANGING) }
                }
            }
        },
        {
            level: 2,
            format: LevelFormat.BULLET,
            text: "\u2023", // triangular bullet
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(LIST_LEFT * 3), hanging: convertInchesToTwip(LIST_HANGING) }
                }
            }
        },
        {
            level: 3,
            format: LevelFormat.BULLET,
            text: "\u2043", // hyphen bullet
            alignment: AlignmentType.START,
            style: {
                paragraph: {
                    indent: { left: convertInchesToTwip(LIST_LEFT * 4), hanging: convertInchesToTwip(LIST_HANGING) }
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
    const htmls = paragraphs.map(n => `<p><u>${n.title}</u></p><p>${n.content}</p><br/>`)
    const processedHtmls = htmls.map(html => replaceTemplates(html, replacements))
    const builder = new DocxBuilderClient()
    const convertor = new Html2Docx({ languageToolRules: LANGUAGETOOL_RULES })
    const docxParagraphs = processedHtmls.map(html => convertor.toParagraphs(html))
    const numbering = convertor.createListStyles(NUMBERED_LIST_STYLES, BULLET_LIST_STYLES)
    const doc = builder.document({
        sections: [
            builder.section({
                children: docxParagraphs
            })
        ],
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
