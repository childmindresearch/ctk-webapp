import { dsmCodes } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging"
import { StatusCode } from "$lib/utils.js"
import { json } from "@sveltejs/kit"
import { putDsmRequestSchema, type PutDsmRequest, type PutDsmResponse } from "./index.js"
import { db } from "$lib/server/db"
import { eq } from "drizzle-orm"

export async function PUT({ params, request }) {
    let id: number
    try {
        id = Number(params.id)
    } catch {
        return new Response("Could not parse ID.", { status: StatusCode.BAD_REQUEST })
    }
    let body: PutDsmRequest
    try {
        body = putDsmRequestSchema.parse(await request.json())
    } catch {
        return new Response("Invalid request body.", { status: StatusCode.BAD_REQUEST })
    }
    logger.info("Editing DSM Code.")
    try {
        const row = await db.update(dsmCodes).set(body).where(eq(dsmCodes.id, id)).returning()
        return json(row[0] as PutDsmResponse)
    } catch {
        return new Response("Unknown error.", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }
}

export async function DELETE({ params }) {
    let id: number
    try {
        id = Number(params.id)
    } catch {
        return new Response("Could not parse ID.", { status: StatusCode.BAD_REQUEST })
    }

    try {
        await db.delete(dsmCodes).where(eq(dsmCodes.id, id))
        return new Response("")
    } catch {
        return new Response("Unknown error.", { status: StatusCode.INTERNAL_SERVER_ERROR })
    }
}
