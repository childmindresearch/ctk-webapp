import type { DecisionTree } from "$lib/utils"
import type { Writable } from "svelte/store"
import { browser } from "$app/environment"
import { writable } from "svelte/store"
import type { skeletonThemes } from "./utils"

export const diagnosesTree: Writable<DecisionTree[]> = writable()
export const anonymizedReport = writable(Promise.resolve(""))

let preferredTheme: skeletonThemes = "skeleton"
if (browser && localStorage.preferredTheme) {
  preferredTheme = localStorage.preferredTheme
}

export const currentTheme = writable(preferredTheme)
if (browser) {
  currentTheme.subscribe(value => {
    localStorage.preferredTheme = value
  })
}
