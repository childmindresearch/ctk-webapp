import { json } from "@sveltejs/kit"
import { logger } from "$lib/server/logging.js"
import { getFilterSets } from "../fetchers.js"

export async function GET() {
    logger.info("Getting all filter sets.")
    try {
        const filterSets = await getFilterSets()
        return json(filterSets)
    } catch (error) {
        logger.error("Error fetching providers:", error)
        return new Response("Could not fetch providers.", { status: 500 })
    }
}
