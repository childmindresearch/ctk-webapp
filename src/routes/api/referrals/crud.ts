import { db } from "$lib/server/db"
import { referralFilterGroups, referralProviders } from "$lib/server/db/schema.js"
import { json } from "@sveltejs/kit"
import { eq, inArray } from "drizzle-orm"
import { type PgTableWithColumns } from "drizzle-orm/pg-core"

export async function getProviders(ids: number[] | undefined = undefined) {
    const whereCondition = ids ? inArray(referralProviders.id, ids) : undefined
    return await db.query.referralProviders.findMany({
        where: whereCondition,
        with: {
            addresses: true
        }
    })
}

export async function getFilterGroups(ids: number[] | undefined = undefined) {
    const whereCondition = ids ? inArray(referralFilterGroups.id, ids) : undefined
    return await db.query.referralFilterGroups.findMany({
        where: whereCondition,
        with: {
            filterSets: true
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function genericPost<T extends PgTableWithColumns<any>>(request: Request, model: T) {
    const acceptConflict = request.headers.get("X-Accept-Conflict") === "true"
    const data = await request.json()
    let parsedData: T["$inferInsert"]
    try {
        parsedData = model.parse(data)
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request format", details: error }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        })
    }

    try {
        let newEntry: T["$inferInsert"] | undefined
        if (acceptConflict) {
            newEntry = await db.insert(model).values(parsedData).onConflictDoNothing().returning()
        } else {
            newEntry = await db.insert(model).values(parsedData).returning()
        }
        return json(newEntry, { status: 201 })
    } catch (error) {
        console.error(`Error creating ${model.name}:`, error)
        return new Response(JSON.stringify({ error: `Failed to create ${model.name}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function genericPut<T extends PgTableWithColumns<any>>(request: Request, model: T, id: number) {
    const data = await request.json()
    let parsedData: T["$inferInsert"]
    try {
        parsedData = model.parse(data)
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid request format", details: error }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        })
    }

    try {
        const updatedEntry = await db.update(model).set(parsedData).where(eq(model.id, id)).returning()
        return json(updatedEntry, { status: 200 })
    } catch (error) {
        console.error(`Error updating ${model.name}:`, error)
        return new Response(JSON.stringify({ error: `Failed to update ${model.name}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        })
    }
}
