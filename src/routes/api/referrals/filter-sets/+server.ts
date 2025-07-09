import { json } from "@sveltejs/kit"
import { logger } from "$lib/server/logging.js"
import { getFilterSets } from "../fetchers.js"
import { z } from "zod"
import { db } from "$lib/server/db/index.js"
import { referralFilterSetServiceRelations, referralFilterSets } from "$lib/server/db/schema.js"

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

const PostFilterSetSchema = z.object({
    name: z.string(),
    locations: z.array(z.string()),
    service_ids: z.array(z.number())
})

export async function POST({ request }) {
    logger.info("Creating a new filter set.")
    try {
        const requestData = await request.json()
        const { name, locations, service_ids } = PostFilterSetSchema.parse(requestData)

        const newFilterSet = await db.transaction(async tx => {
            const filterSet = (await tx.insert(referralFilterSets).values({ name, locations }).returning())[0]

            await Promise.all(
                service_ids.map(serviceId => {
                    tx.insert(referralFilterSetServiceRelations).values({ filterSetId: filterSet.id, serviceId })
                })
            )

            return filterSet
        })

        return json(newFilterSet, { status: 201 })
    } catch (error) {
        logger.error("Error creating filter set:", error)
        return new Response("Could not create filter set.", { status: 500 })
    }
}
