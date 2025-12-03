import { db } from "$lib/server/db"
import { dsmCodes } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils"
import { json } from "@sveltejs/kit"
import { postDsmRequestSchema, type GetDsmResponse, type PostDsmRequest, type PostDsmResponse } from "./index.js"

export async function GET() {
    logger.info("Getting all DSM codes")
    try {
        const rows = await db.select().from(dsmCodes)
        return json(rows as GetDsmResponse)
    } catch (error) {
        logger.error("Error getting all DSM codes", error)
        return new Response("Unknown error.", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }
}

export async function POST({ request }) {
    logger.info("Posting a new DSM code")
    let body: PostDsmRequest
    try {
        body = postDsmRequestSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }
    try {
        const row = (await db.insert(dsmCodes).values([body]).returning())[0]
        return json(row as PostDsmResponse)
    } catch (error) {
        logger.error("Error getting all templates:", error)
        return new Response("Unknown error.", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }
}
