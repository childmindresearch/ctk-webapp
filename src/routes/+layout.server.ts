import type { User } from "$lib/types"
import { DEVELOPMENT_USER } from "$lib/server/environment.js"
import { pool } from "$lib/server/sql"
import type { Props } from "$lib/components/Navigation/Navigation.svelte"
import { StatusCode } from "$lib/utils"

export async function load({ request }) {
  const userEmail = request.headers.get("X-MS-CLIENT-PRINCIPAL-NAME") || DEVELOPMENT_USER
  const userQuery = {
    text: "SELECT * FROM users WHERE email = $1",
    values: [userEmail]
  }
  const user: User = await pool.connect().then(async client => {
    const result = await client.query(userQuery)
    client.release()
    return result.rows[0]
  })

  if (!user) {
    return {
      status: StatusCode.UNAUTHORIZED,
      error: "User not found."
    }
  }

  const pages: Props["pages"] = [
    { name: "DSM Codes", href: "/dsm" },
    { name: "Intake", href: "/intake" },
    { name: "Pyrite Reports", href: "/pyrite", badge: "Alpha" },
    { name: "Summarization", href: "/summarization" },
    { name: "Templates", href: "/templates" }
  ]

  if (user.is_admin) {
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
