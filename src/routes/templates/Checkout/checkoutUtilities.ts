import { downloadBlob } from "$lib/utils"
import { giveMarkdownUrlsHyperlinks } from "$lib/utils"

export function allUpperCaseDashToCapitalizedSpace(input: string): string {
    return input
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")
}

type TemplateValue = {
    type: "input" | "warning" | "pronoun"
    text: string
}

const pronounRegex = /{{(PRONOUN-[0-4])}}/g
const warningRegex = /{{!(.*?)}}/g
const inputRegex = /{{(.*?)}}/g

export function getTemplateValues(text: string): TemplateValue[] {
    const values: TemplateValue[] = []

    let match
    while ((match = pronounRegex.exec(text)) !== null) {
        values.push({ type: "pronoun", text: match[1] })
    }
    while ((match = warningRegex.exec(text)) !== null) {
        values.push({ type: "warning", text: match[1] })
    }
    while ((match = inputRegex.exec(text)) !== null) {
        if (match[0].startsWith("{{!") || match[0].startsWith("{{PRONOUN-")) continue
        values.push({ type: "input", text: match[1] })
    }
    return values
}

export async function submitMarkdownToDocx(markdown: string, rules: string[]) {
    const languageToolForm = new FormData()
    languageToolForm.append("text", markdown)
    languageToolForm.append("rules", JSON.stringify(rules))

    let text: string
    if (rules.length === 0) {
        text = markdown
    } else {
        const languageToolResponse = await fetch("/api/language-tool", {
            method: "POST",
            body: languageToolForm
        })

        if (!languageToolResponse.ok) {
            throw new Error(await languageToolResponse.text())
        }
        text = await languageToolResponse.text()
    }

    text = giveMarkdownUrlsHyperlinks(text)
    // Pandoc does not support tabs. We use |t as a workaround.
    const textWithEncodedTab = text.replace(/\t/g, "|t")
    const markdown2DocxForm = new FormData()
    markdown2DocxForm.append("markdown", textWithEncodedTab)
    markdown2DocxForm.append("formatting", JSON.stringify({ space_before: 0, space_after: 0 }))

    const docxResponse = await fetch("/api/markdown2docx", {
        method: "POST",
        body: markdown2DocxForm
    })
    if (!docxResponse.ok) {
        throw new Error(await docxResponse.text())
    }

    const blob = await docxResponse.blob()
    const filename = "templates.docx"
    downloadBlob(blob, filename)
}
