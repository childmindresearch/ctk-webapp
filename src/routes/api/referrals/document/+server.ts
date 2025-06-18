import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"
import { z } from "zod"
import { isModel, zodValidateOr400 } from "$lib/server/zod_utils.js"

const PostReferralSchema = z.array(z.array(z.string()))

export async function POST({ fetch, request }) {
    logger.info("Creating referral table document")

    const referralData = await request.json()
    const providerRequest = zodValidateOr400(PostReferralSchema, referralData)
    if (!isModel(PostReferralSchema, providerRequest)) {
        return providerRequest
    }

    return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/referral`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(referralData)
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
