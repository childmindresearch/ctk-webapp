import { writable } from "svelte/store"

export let openNodeIds = writable<Set<number>>(new Set())
