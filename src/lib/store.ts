import { writable } from "svelte/store"

export const anonymizedReport = writable(Promise.resolve(""))
