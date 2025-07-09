import { db } from "$lib/server/db"
import { referralProviders, referralFilterSets } from "$lib/server/db/schema.js"
import { inArray } from "drizzle-orm"

export async function getProviders(ids: number[] | undefined = undefined) {
    const whereCondition = ids ? inArray(referralProviders.id, ids) : undefined
    return await db.query.referralProviders.findMany({
        where: whereCondition,
        with: {
            service: true,
            addresses: {
                with: {
                    location: true
                }
            },
            subServices: true
        }
    })
}

export async function getFilterSets(ids: number[] | undefined = undefined) {
    const whereCondition = ids ? inArray(referralFilterSets.id, ids) : undefined
    return await db.query.referralFilterSets.findMany({
        where: whereCondition,
        with: {
            locations: true,
            services: true
        }
    })
}
