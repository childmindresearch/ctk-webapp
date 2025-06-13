import { db } from "$lib/server/db"
import { provider } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { getProviders } from "../fetchers"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

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

export async function DELETE({ params }) {
    const id = Number(params.id)
    try {
        await db.delete(provider).where(eq(provider.id, id))
        return new Response(null, { status: 200 })
    } catch (error) {
        logger.error(`Error deleting provider ${id}`, error)
        return new Response("Could not delete provider.", { status: 500 })
    }
}
