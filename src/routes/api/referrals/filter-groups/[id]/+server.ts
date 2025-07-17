import { getFilterGroups } from "$api/referrals/crud"
import { db } from "$lib/server/db"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { PostFilterGroup } from "$api/referrals/filter-groups/schemas"
import { referralFilterGroups, referralFilterSetServiceJunction, referralFilterSets } from "$lib/server/db/schema.js"

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

export async function PUT({ params, request }) {
    try {
        const id = Number(params.id)
        logger.info(`Editting filter set ${id}.`)

        const requestData = await request.json()
        const { name, filterSets } = PostFilterGroup.parse(requestData)

        await db.transaction(async tx => {
            await tx.delete(referralFilterSets).where(eq(referralFilterSets.groupId, id))
            await Promise.all([
                tx.update(referralFilterGroups).set({ name }).where(eq(referralFilterGroups.id, id)),
                Promise.all(
                    filterSets.map(async fset => {
                        const [newFilterSet] = await tx
                            .insert(referralFilterSets)
                            .values({ ...fset, groupId: id })
                            .returning()
                        await Promise.all([
                            fset.services.map(service => {
                                tx.insert(referralFilterSetServiceJunction).values({
                                    filterSetId: newFilterSet.id,
                                    serviceId: service.id
                                })
                            })
                        ])
                    })
                )
            ])
        })
        const [updatedFilterGroup] = await getFilterGroups([id])
        return json(updatedFilterGroup, { status: 201 })
    } catch (error) {
        logger.error("Error creating filter set:", error)
        return new Response("Could not create filter set.", { status: 500 })
    }
}
