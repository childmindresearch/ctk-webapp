import { DEVELOPMENT_USER } from "$lib/server/environment.js"
import type { Props } from "$lib/components/Navigation/Navigation.svelte"
import { StatusCode } from "$lib/utils"
import { eq } from "drizzle-orm"
import { db } from "$lib/server/db/index.js"
import { users } from "$lib/server/db/schema.js"
import { logger } from "$lib/server/logging.js"

export async function load({ request }) {
    const userEmail = request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME") || DEVELOPMENT_USER
    let usersFound: (typeof users.$inferSelect)[]
    try {
        usersFound = await db.select().from(users).where(eq(users.email, userEmail))
    } catch (error) {
        logger.error("Error finding user:", error)
        return {
            status: StatusCode.INTERNAL_SERVER_ERROR,
            error: "Could not fetch user."
        }
    }
    if (usersFound.length > 1) {
        throw new Error("More than one user found. This should never happen.")
    }
    if (usersFound.length == 0) {
        return {
            status: StatusCode.UNAUTHORIZED,
            error: "User not found."
        }
    }
    const user = usersFound[0]

    const pages: Props["pages"] = [
        { name: "DSM Codes", href: "/dsm" },
        { name: "Intake", href: "/intake" },
        { name: "Pyrite Reports", href: "/pyrite", badge: "Alpha" },
        { name: "Summarization", href: "/summarization" },
        { name: "Templates", href: "/templates" }
    ]

    if (user.isAdmin) {
        pages.push({
            name: "Referrals",
            badge: "Alpha",
            subPages: [
                { name: "Download", href: "/referrals" },
                { name: "Providers", href: "/referrals/admin/providers" },
                { name: "Document Creation", href: "/referrals/admin/filter-groups" }
            ]
        })
    }

    pages.sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
    })

    return { user, navbarPages: pages }
}
