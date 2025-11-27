import { writable } from "svelte/store"

export const openNodeIds = writable<Set<number>>(new Set())
