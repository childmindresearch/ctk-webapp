import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"
import { z } from "zod"

const PostReferralSchema = z.array(z.array(z.string()))

export async function POST({ fetch, request }) {
    logger.info("Creating referral table document")

    const referralData = await request.json()
    let providerRequest: string[][]
    try {
        providerRequest = PostReferralSchema.parse(referralData)
    } catch (error) {
        logger.error("Invalid referral data format", error)
        return new Response(JSON.stringify({ error: "Invalid request format", details: error }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        })
    }

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/referral`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(providerRequest)
    })
        .then(async response => {
            if (response.ok && response.body) {
                return new Response(response.body)
            } else {
                throw new Error(await response.text())
            }
        })
        .catch(error => {
            logger.error("Error getting referral document.", error)
            return new Response(null, { status: 500 })
        })
}
