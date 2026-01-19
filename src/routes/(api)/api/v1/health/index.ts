import { StatusCode } from "$lib/utils"
import { Endpoint } from "$lib/utils"

export type GetHealthResponse = string

const path = () => "/api/v1/health"
/**
 * Endpoint to check the health status of the API service.
 * Use the .fetch() method to run the query.
 */
export const GetHealth = new Endpoint<undefined, typeof path, undefined>({
    method: "GET",
    path,
    successCodes: [StatusCode.OK]
})
