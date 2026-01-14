import type z from "zod"

function deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false

    if (typeof a === "object") {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false

        // @ts-expect-error deepEqual accepts any type.
        return keysA.every(key => deepEqual(a[key], b[key]))
    }

    return false
}

export function isUnique<T>(value: T, index: number, array: Array<T>) {
    return array.findIndex(item => deepEqual(item, value)) === index
}

export function shortenText(str: string, maxLength = 200) {
    if (str.length > maxLength) {
        return str.substring(0, maxLength).trim() + "..."
    }
    return str
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(url)
    link.remove()
}

export function giveMarkdownUrlsHyperlinks(text: string) {
    const urlRegex =
        /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi // eslint-disable-line

    const urls = text.match(urlRegex)
    if (!urls) return text
    urls.forEach(url => {
        let hyperlink = url
        if (url.startsWith("www.")) {
            hyperlink = `http://${url}`
        }
        text = text.replace(url, `[${url}](${hyperlink})`)
    })
    return text
}

export function oxfordComma(arr: readonly string[]) {
    if (arr.length === 0) return ""
    if (arr.length === 1) return arr[0]
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`

    return `${arr.slice(0, -1).join(", ")}, and ${arr[arr.length - 1]}`
}

export const StatusCode = Object.freeze({
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,

    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IM_USED: 226,

    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511
})

export class FetchError extends Error {
    readonly status: number | undefined

    constructor(reason: string, status?: number) {
        super(reason)
        this.name = "FetchError"
        this.status = status
    }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
type ResponseType = "json" | "blob" | "text"

/**
 * Represents an HTTP endpoint with typed request and response handling.
 *
 * @template TResponse - The expected response type returned by the endpoint.
 * @template TPath - A function type that constructs the endpoint path from arguments.
 * @template TSchema - An optional Zod schema type used to validate the request body.
 *
 * @example
 * ```typescript
 * const endpoint = new Endpoint<MyResponseType, typeof myPathFn, typeof mySchema>({
 *   method: "POST",
 *   path: myPathFn,
 *   successCodes: [StatusCode.OK],
 *   schema: mySchema,
 *   responseType: "json"
 * });
 * ```
 */
export class Endpoint<
    TResponse,
    // Endpoint implementations must specifiy exact types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TPath extends (...args: any[]) => string = (...args: (string | number)[]) => string,
    TSchema extends z.ZodType | undefined = undefined
> {
    private method: Method
    private path: TPath
    private schema: TSchema | undefined
    private successCodes: (typeof StatusCode)[keyof typeof StatusCode][]
    private responseType: ResponseType

    constructor(options: {
        method: Method
        path: TPath
        successCodes: (typeof StatusCode)[keyof typeof StatusCode][]
        schema?: TSchema
        responseType?: ResponseType
    }) {
        this.method = options.method
        this.path = options.path
        this.successCodes = options.successCodes
        this.schema = options.schema
        this.responseType = options.responseType ?? "json"
    }

    /**
     * Sends an HTTP request using the specified options and returns the parsed response or a `FetchError`.
     *
     * @param options - The options for the fetch request.
     * @param options.fetchOptions - Additional options to pass to the native `fetch` API.
     * @param options.pathArgs - Arguments to construct the request path. Required if the path function expects parameters.
     * @param options.body - The request body.
     * @returns A promise that resolves to the parsed response of type `TResponse`, or a `FetchError` if the request fails or the response is invalid.
     *
     * @template TPath - The type of the path function used to construct the request URL.
     * @template TSchema - The Zod schema type used to validate the request body.
     * @template TResponse - The expected response type.
     */
    public async fetch(options: {
        fetchOptions?: RequestInit
        pathArgs?: Parameters<TPath>["length"] extends 0 ? never : Parameters<TPath>
        body?: TSchema extends z.ZodType ? z.infer<TSchema> : never
    }): Promise<TResponse | FetchError> {
        const { fetchOptions, pathArgs = [], body } = options
        let path: string
        try {
            path = this.path(...pathArgs)
        } catch {
            return new FetchError(`Invalid path arguments ${pathArgs.join(", ")}`)
        }

        let parsedBody: z.infer<TSchema> | undefined = undefined
        if (this.schema) {
            try {
                parsedBody = this.schema.parse(body) as z.infer<TSchema>
            } catch {
                return new FetchError("Invalid body.")
            }
        }

        let response: Response
        try {
            response = await fetch(path, {
                ...fetchOptions,
                body: parsedBody !== undefined ? JSON.stringify(parsedBody) : undefined,
                headers: {
                    ...fetchOptions?.headers
                },
                method: this.method
            })
        } catch (error) {
            return new FetchError(error instanceof Error ? error.message : "Unknown error ocurred.")
        }

        if (!this.successCodes.includes(response.status as (typeof StatusCode)[keyof typeof StatusCode])) {
            return new FetchError(`Invalid status ${response.status}`, response.status)
        }

        if (response.status === StatusCode.NO_CONTENT) {
            return null as TResponse
        }
        try {
            if (this.responseType === "json") {
                return (await response.json()) as TResponse
            }
            return (await response.blob()) as TResponse
        } catch {
            return new FetchError("Failed to parse response.", response.status)
        }
    }
}
