import { json } from "@sveltejs/kit"
import { logger } from "$lib/server/logging.js"
import { getFilterSets } from "../fetchers.js"
import { z } from "zod"
import { db } from "$lib/server/db/index.js"
import {
    referralFilterSetLocationsJunction,
    referralFilterSetServiceJunction,
    referralFilterSets
} from "$lib/server/db/schema.js"
import { inArray } from "drizzle-orm"

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
    locations: z.array(
        z.object({
            id: z.number(),
            name: z.string()
        })
    ),
    services: z.array(
        z.object({
            id: z.number(),
            name: z.string()
        })
    )
})

export async function POST({ request }) {
    logger.info("Creating a new filter set.")
    try {
        const requestData = await request.json()
        const { name, locations, services } = PostFilterSetSchema.parse(requestData)

        const location_ids = locations.map(location => location.id)
        const service_ids = services.map(service => service.id)

        const [existingLocations, existingServices] = await Promise.all([
            db
                .select()
                .from(referralFilterSetLocationsJunction)
                .where(inArray(referralFilterSetLocationsJunction.locationId, location_ids)),
            db
                .select()
                .from(referralFilterSetServiceJunction)
                .where(inArray(referralFilterSetServiceJunction.serviceId, service_ids))
        ])

        if (existingLocations.length !== location_ids.length || existingServices.length !== service_ids.length) {
            return new Response("One or more locations or services do not exist.", { status: 400 })
        }

        const newFilterSet = await db.transaction(async tx => {
            const filterSet = (await tx.insert(referralFilterSets).values({ name }).returning())[0]

            await Promise.all([
                Promise.all(
                    services.map(service =>
                        tx
                            .insert(referralFilterSetServiceJunction)
                            .values({ filterSetId: filterSet.id, serviceId: service.id })
                    )
                ),
                Promise.all(
                    locations.map(location =>
                        tx
                            .insert(referralFilterSetLocationsJunction)
                            .values({ filterSetId: filterSet.id, locationId: location.id })
                    )
                )
            ])

            return filterSet
        })

        return json(newFilterSet, { status: 201 })
    } catch (error) {
        logger.error("Error creating filter set:", error)
        return new Response("Could not create filter set.", { status: 500 })
    }
}
