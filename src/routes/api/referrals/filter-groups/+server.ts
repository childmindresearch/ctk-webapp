import { json } from "@sveltejs/kit"
import { logger } from "$lib/server/logging.js"
import { db } from "$lib/server/db/index.js"
import { referralFilterGroups, referralFilterSets } from "$lib/server/db/schema.js"
import { getFilterGroups } from "../crud"
import { PostFilterGroup } from "./schemas"

export async function GET() {
    logger.info("Getting all filter groups.")
    try {
        const filterGroups = await getFilterGroups()
        return json(filterGroups)
    } catch (error) {
        logger.error("Error fetching providers:", error)
        return new Response("Could not fetch providers.", { status: 500 })
    }
}

export async function POST({ request }) {
    logger.info("Creating a new filter set.")
    try {
        const requestData = await request.json()
        const { name, filterSets } = PostFilterGroup.parse(requestData)

        const newId = await db.transaction(async tx => {
            const [newFilterGroup] = await tx.insert(referralFilterGroups).values({ name }).returning()
            await Promise.all(
                filterSets.map(async fset => {
                    await tx
                        .insert(referralFilterSets)
                        .values({ ...fset, groupId: newFilterGroup.id })
                        .returning()
                })
            )
            return newFilterGroup.id
        })
        const [newFilterGroup] = await getFilterGroups([newId])

        return json(newFilterGroup, { status: 201 })
    } catch (error) {
        logger.error("Error creating filter set:", error)
        return new Response("Could not create filter set.", { status: 500 })
    }
}
