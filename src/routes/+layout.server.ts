import { DEVELOPMENT_USER } from "$lib/server/environment.js"
import { pool } from "$lib/server/sql"

type User = {
    id: number
    email: string
    is_admin: boolean
    is_alpha_user: boolean
}

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
            status: 401,
            error: "User not found."
        }
    }

    return { user }
}
