import { logger } from "$lib/server/logging"
import { LANGUAGETOOL_URL } from "$lib/server/environment"
import { json, error } from "@sveltejs/kit"

export async function POST({ fetch, request }) {
    logger.info("Running LanguageTool")

    try {
        const body = await request.json()
        const { text, language = "en-US" } = body

        if (!text || typeof text !== "string") {
            throw error(400, "Text is required")
        }

        const params = new URLSearchParams({
            text: text,
            language: language,
            enabledOnly: "false"
        })

        const response = await fetch(`${LANGUAGETOOL_URL}/v2/check`, {
            method: "POST",
            body: params,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        if (!response.ok) {
            const errorText = await response.text()
            logger.error("LanguageTool API error:", errorText)
            throw error(response.status, `LanguageTool API error: ${errorText}`)
        }

        const data = await response.json()
        const correctedText = applyCorrections(text, data.matches)

        return json({
            original: text,
            corrected: correctedText
        })
    } catch (err) {
        logger.error("Error processing LanguageTool request:", err)
        throw error(500, "Internal server error processing text")
    }
}

type Match = {
    offset: number
    replacements: { value: string }[]
    length: number
}

function applyCorrections(text: string, matches: Match[]): string {
    let correctedText = text

    const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset)
    sortedMatches.forEach(match => {
        if (match.replacements && match.replacements.length > 0) {
            const replacement = match.replacements[0].value
            const start = match.offset
            const end = start + match.length

            correctedText = correctedText.substring(0, start) + replacement + correctedText.substring(end)
        }
    })

    return correctedText
}
