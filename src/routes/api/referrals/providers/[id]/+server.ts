import { logger } from "$lib/server/logging"
import { getProviders } from "../fetchers"
import { json } from "@sveltejs/kit"

export async function GET({ params }) {
    const id = Number(params.id)
    try {
        const provider = (await getProviders(id))[0]
        return json(provider)
    } catch (error) {
        logger.error(`Error fetching provider ${id}:`, error)
        return new Response("Could not fetch provider.", { status: 500 })
    }
}
