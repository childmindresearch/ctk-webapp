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
