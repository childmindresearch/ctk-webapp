import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function POST({ fetch, request }) {
    logger.info("Creating referral table document")

    const body = JSON.parse(await request.text())
    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/referral_table_docx`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: body.title,
            row_data: body.row_data
        })
    })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            logger.error("Error converting markdown to docx:", error)
            return new Response(null, { status: 500 })
        })
}
