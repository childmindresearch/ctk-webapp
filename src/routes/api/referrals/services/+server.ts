import { db } from "$lib/server/db"
import { referralServices } from "$lib/server/db/schema.js"
import { json } from "@sveltejs/kit"
import { genericPost } from "$api/referrals/crud.js"

export async function GET() {
    return json(await db.select().from(referralServices))
}

export async function POST({ request }) {
    return await genericPost(request, referralServices)
}
