import { logger } from "$lib/server/logging"
import { LANGUAGETOOL_URL } from "$lib/server/environment"
import { error, json } from "@sveltejs/kit"

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

        return json(await response.json())
    } catch (err) {
        logger.error("Error processing LanguageTool request:", err)
        throw error(500, "Internal server error processing text")
    }
}
