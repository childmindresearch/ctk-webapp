import { json } from "@sveltejs/kit"
import { db } from "$lib/server/db"
import { logger } from "$lib/server/logging.js"
import { providerLocation } from "$lib/server/db/schema"
import { z } from "zod"
import { isModel, zodValidateOr400 } from "$lib/server/zod_utils.js"

export async function GET() {
    logger.info("Getting all locations.")
    try {
        const locations = await db.select().from(providerLocation)

        return json(locations)
    } catch (error) {
        console.error("Error fetching locations:", error)
        return new Response("Could not fetch locations.", { status: 500 })
    }
}

const PostLocationSchema = z.object({
    name: z.string()
})

export async function POST({ request }) {
    try {
        const data = await request.json()
        if (data === null) {
            return new Response("Could not read body.", { status: 500 })
        }
        const validation = zodValidateOr400(PostLocationSchema, data)
        if (!isModel(PostLocationSchema, validation)) {
            return validation
        }

        const location = await db.insert(providerLocation).values({ name: validation.name }).returning()
        if (location.length === 0) {
            return new Response("Could not insert location.", { status: 500 })
        }
        return new Response(JSON.stringify(location[0]), { status: 201 })
    } catch (error) {
        console.error("Error inserting location:", error)
        return new Response("Could not insert location.", { status: 500 })
    }
}
