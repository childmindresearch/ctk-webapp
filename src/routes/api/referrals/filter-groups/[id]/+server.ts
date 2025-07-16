import { getFilterGroups } from "$api/referrals/crud"
import { db } from "$lib/server/db"
import { referralFilterGroups } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

export async function GET({ params }) {
    const id = Number(params.id)
    try {
        const provider = (await getFilterGroups([id]))[0]
        return json(provider)
    } catch (error) {
        logger.error(`Error fetching provider ${id}:`, error)
        return new Response("Could not fetch provider.", { status: 500 })
    }
}

export async function DELETE({ params }) {
    const id = Number(params.id)
    try {
        await db.delete(referralFilterGroups).where(eq(referralFilterGroups.id, id))
        return new Response(null, { status: 200 })
    } catch (error) {
        logger.error(`Error deleting provider ${id}`, error)
        return new Response("Could not delete provider.", { status: 500 })
    }
}
