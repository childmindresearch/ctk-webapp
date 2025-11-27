import { StatusCode } from "$lib/utils"
import { Endpoint } from "$lib/utils"

export type GetHealthResponse = string

const path = () => "/api/v1/health"
export const GetHealth = new Endpoint<undefined, typeof path, undefined>({
    method: "GET",
    path,
    successCodes: [StatusCode.OK]
})
