import type { EndpointDefinition } from "$lib/types"
import type { StatusCode } from "$lib/utils"

export * from "./dsm"
export * from "./llm"

export async function fetchEndpoint<TResponse, TEndpoint extends EndpointDefinition>(
    endpoint: TEndpoint,
    onError: () => void,
    options: Parameters<TEndpoint["pattern"]> extends []
        ? {
              pathArgs?: never
              fetchOptions?: RequestInit
          }
        : {
              pathArgs: Parameters<TEndpoint["pattern"]>
              fetchOptions?: RequestInit
          }
): Promise<TResponse | null> {
    const { pathArgs = [], fetchOptions = {} } = options ?? {}

    const response = await fetch(endpoint.pattern(...pathArgs), fetchOptions)

    if (endpoint.successCodes.includes(response.status as (typeof StatusCode)[keyof typeof StatusCode])) {
        return await response.json()
    }

    onError()
    return null
}
