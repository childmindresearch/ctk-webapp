import { redirect } from "@sveltejs/kit"
import { StatusCode } from "$lib/utils"

export function load() {
    redirect(StatusCode.TEMPORARY_REDIRECT, "/templates")
}
