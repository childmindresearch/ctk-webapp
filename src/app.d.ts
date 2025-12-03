import { users } from "$lib/server/db/"

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            user: typeof users.$inferSelect
            requestId: string
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export {}
