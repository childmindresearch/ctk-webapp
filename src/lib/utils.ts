import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type z from "zod"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deepEqual(a: any, b: any): boolean {
    if (a === b) return true
    if (a == null || b == null) return false
    if (typeof a !== typeof b) return false

    if (typeof a === "object") {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false

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

export class Endpoint<
    TResponse,
    TPattern extends (...args: (string | number)[]) => string = (...args: (string | number)[]) => string,
    TSchema extends z.ZodType | undefined = undefined
> {
    private pattern: TPattern
    private schema: TSchema | undefined
    private successCodes: (typeof StatusCode)[keyof typeof StatusCode][]
    private method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

    constructor(
        pattern: TPattern,
        successCodes: (typeof StatusCode)[keyof typeof StatusCode][],
        schema: TSchema | undefined = undefined,
        method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    ) {
        this.pattern = pattern
        this.schema = schema
        this.successCodes = successCodes
        this.method = method
    }

    public async fetch(options: {
        fetchOptions?: RequestInit
        pathArgs?: Parameters<TPattern>["length"] extends 0 ? never : Parameters<TPattern>
        body?: TSchema extends z.ZodType ? z.infer<TSchema> : never
    }): Promise<TResponse | FetchError> {
        const { fetchOptions, pathArgs = [], body } = options
        let path: string
        try {
            path = this.pattern(...pathArgs)
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
                    ...(fetchOptions?.headers ?? {})
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
            return (await response.json()) as TResponse
        } catch {
            return new FetchError("Failed to parse response JSON", response.status)
        }
    }
}
