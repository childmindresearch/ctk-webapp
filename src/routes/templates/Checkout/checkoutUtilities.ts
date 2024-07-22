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
        if (warningRegex.test(match[0]) || pronounRegex.test(match[0])) continue
        values.push({ type: "input", text: match[1] })
    }
    return values
}

export async function submitMarkdownToDocx(markdown: string, rules: string[]) {
    const form = new FormData()
    form.append("text", markdown)
    form.append("rules", rules.join(","))

    let text: string
    if (rules.length === 0) {
        text = markdown
    } else {
        const languageToolResponse = await fetch("/api/language-tool", {
            method: "POST",
            body: form
        })

        if (!languageToolResponse.ok) {
            throw new Error(await languageToolResponse.text())
        }
        text = await languageToolResponse.text()
    }

    text = giveMarkdownUrlsHyperlinks(text)
    const docxResponse = await fetch("/api/markdown2docx", {
        method: "POST",
        body: text
    })
    if (!docxResponse.ok) {
        throw new Error(await docxResponse.text())
    }

    const blob = await docxResponse.blob()
    const filename = "templates.docx"
    downloadBlob(blob, filename)
}
