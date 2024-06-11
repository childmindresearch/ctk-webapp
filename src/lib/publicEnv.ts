import { env } from "$env/dynamic/public"

export const PUBLIC_WOPI_URL = env.PUBLIC_WOPI_URL || ""
export const PUBLIC_COLLABORA_URL: string = env.PUBLIC_COLLABORA_URL || ""
