import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
    Endpoint,
    StatusCode,
    FetchError,
    oxfordComma,
    giveMarkdownUrlsHyperlinks,
    downloadBlob,
    shortenText,
    isUnique
} from "./utils"
import { z } from "zod"

describe("isUnique", () => {
    it("should filter out duplicate primitives", () => {
        const arr = [1, 2, 2, 3, 3, 3]
        const result = arr.filter(isUnique)
        expect(result).toEqual([1, 2, 3])
    })

    it("should filter out duplicate objects", () => {
        const arr = [
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" },
            { id: 1, name: "Alice" }
        ]
        const result = arr.filter(isUnique)
        expect(result).toEqual([
            { id: 1, name: "Alice" },
            { id: 2, name: "Bob" }
        ])
    })

    it("should handle nested objects", () => {
        const arr = [
            { user: { id: 1, meta: { active: true } } },
            { user: { id: 1, meta: { active: true } } },
            { user: { id: 2, meta: { active: false } } }
        ]
        const result = arr.filter(isUnique)
        expect(result).toEqual([
            { user: { id: 1, meta: { active: true } } },
            { user: { id: 2, meta: { active: false } } }
        ])
    })

    it("should handle empty arrays", () => {
        const arr: number[] = []
        const result = arr.filter(isUnique)
        expect(result).toEqual([])
    })

    it("should handle arrays with single element", () => {
        const arr = [1]
        const result = arr.filter(isUnique)
        expect(result).toEqual([1])
    })

    it("should handle mixed types", () => {
        const arr = [1, "1", 1, "1", true, 1]
        const result = arr.filter(isUnique)
        expect(result).toEqual([1, "1", true])
    })
})

describe("shortenText", () => {
    it("should not modify text shorter than maxLength", () => {
        const text = "Hello, World!"
        expect(shortenText(text, 200)).toBe("Hello, World!")
    })

    it("should shorten text longer than maxLength", () => {
        const text = "a".repeat(250)
        const result = shortenText(text, 200)
        expect(result).toBe("a".repeat(200) + "...")
        expect(result.length).toBe(203)
    })

    it("should trim whitespace before adding ellipsis", () => {
        const text = "Hello World     " + "a".repeat(200)
        const result = shortenText(text, 15)
        expect(result).toBe("Hello World...")
    })

    it("should handle empty string", () => {
        expect(shortenText("")).toBe("")
    })

    it("should handle text exactly at maxLength", () => {
        const text = "a".repeat(200)
        expect(shortenText(text, 200)).toBe(text)
    })
})

describe("downloadBlob", () => {
    let createObjectURLSpy: ReturnType<typeof vi.fn>
    let revokeObjectURLSpy: ReturnType<typeof vi.fn>
    let appendChildSpy: ReturnType<typeof vi.fn>
    let removeChildSpy: ReturnType<typeof vi.fn>
    let clickSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
        createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-url")
        revokeObjectURLSpy = vi.fn()
        clickSpy = vi.fn()
        appendChildSpy = vi.fn()
        removeChildSpy = vi.fn()

        global.window = {
            // @ts-expect-error mocks don't replicate full expected object.
            URL: {
                createObjectURL: createObjectURLSpy,
                revokeObjectURL: revokeObjectURLSpy
            }
        }

        global.document = {
            createElement: vi.fn().mockReturnValue({
                click: clickSpy,
                remove: vi.fn(),
                href: "",
                download: ""
            }),
            // @ts-expect-error mocks don't replicate full expected object.
            body: {
                appendChild: appendChildSpy,
                removeChild: removeChildSpy
            }
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it("should create download link and trigger download", () => {
        const blob = new Blob(["test content"], { type: "text/plain" })
        const filename = "test.txt"

        downloadBlob(blob, filename)

        expect(createObjectURLSpy).toHaveBeenCalledWith(blob)
        expect(document.createElement).toHaveBeenCalledWith("a")
        expect(appendChildSpy).toHaveBeenCalled()
        expect(clickSpy).toHaveBeenCalled()
        expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url")
    })

    it("should set correct filename", () => {
        const blob = new Blob(["content"])
        const filename = "my-file.pdf"
        const mockLink = {
            click: vi.fn(),
            remove: vi.fn(),
            href: "",
            download: ""
        }

        // @ts-expect-error mocks don't replicate full expected object.
        vi.mocked(document.createElement).mockReturnValue(mockLink)

        downloadBlob(blob, filename)

        expect(mockLink.download).toBe(filename)
    })

    it("should clean up resources after download", () => {
        const blob = new Blob(["content"])
        const mockLink = {
            click: vi.fn(),
            remove: vi.fn(),
            href: "",
            download: ""
        }

        // @ts-expect-error mocks don't replicate full expected object.
        vi.mocked(document.createElement).mockReturnValue(mockLink)

        downloadBlob(blob, "test.txt")

        expect(revokeObjectURLSpy).toHaveBeenCalled()
        expect(mockLink.remove).toHaveBeenCalled()
    })
})

describe("giveMarkdownUrlsHyperlinks", () => {
    it("should convert HTTP URLs to markdown links", () => {
        const text = "Check out http://example.com for more info"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("Check out [http://example.com](http://example.com) for more info")
    })

    it("should convert HTTPS URLs to markdown links", () => {
        const text = "Visit https://example.com"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("Visit [https://example.com](https://example.com)")
    })

    it("should add http:// prefix to www URLs", () => {
        const text = "Go to www.example.com"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("Go to [www.example.com](http://www.example.com)")
    })

    it("should handle multiple URLs", () => {
        const text = "Visit http://example.com and https://test.org"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("Visit [http://example.com](http://example.com) and [https://test.org](https://test.org)")
    })

    it("should handle URLs with paths and query parameters", () => {
        const text = "API: https://api.example.com/v1/users?id=123"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("API: [https://api.example.com/v1/users?id=123](https://api.example.com/v1/users?id=123)")
    })

    it("should return unchanged text if no URLs present", () => {
        const text = "This is just plain text"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("This is just plain text")
    })

    it("should handle empty string", () => {
        expect(giveMarkdownUrlsHyperlinks("")).toBe("")
    })

    it("should handle IP addresses", () => {
        const text = "Server: http://192.168.1.1:8080"
        const result = giveMarkdownUrlsHyperlinks(text)
        expect(result).toBe("Server: [http://192.168.1.1:8080](http://192.168.1.1:8080)")
    })
})

describe("oxfordComma", () => {
    it("should return empty string for empty array", () => {
        expect(oxfordComma([])).toBe("")
    })

    it("should return single item as-is", () => {
        expect(oxfordComma(["Alice"])).toBe("Alice")
    })

    it('should join two items with "and"', () => {
        expect(oxfordComma(["Alice", "Bob"])).toBe("Alice and Bob")
    })

    it("should use oxford comma for three items", () => {
        expect(oxfordComma(["Alice", "Bob", "Charlie"])).toBe("Alice, Bob, and Charlie")
    })
})

describe("fetch method - successful requests", () => {
    it("should handle successful GET request with JSON response", async () => {
        const mockData = { id: 1, name: "Test" }
        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue(mockData)
        })

        const endpoint = new Endpoint<typeof mockData>({
            method: "GET",
            path: () => "/api/users",
            successCodes: [StatusCode.OK]
        })

        const result = await endpoint.fetch({})

        expect(result).toEqual(mockData)
        expect(global.fetch).toHaveBeenCalledWith("/api/users", {
            body: undefined,
            headers: {},
            method: "GET"
        })
    })

    it("should handle path with parameters", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue({})
        })

        const endpoint = new Endpoint<object, (id: number) => string>({
            method: "GET",
            path: (id: number) => `/api/users/${id}`,
            successCodes: [StatusCode.OK]
        })

        await endpoint.fetch({ pathArgs: [123] })

        expect(global.fetch).toHaveBeenCalledWith("/api/users/123", expect.any(Object))
    })

    it("should handle POST request with validated body", async () => {
        const schema = z.object({
            name: z.string(),
            age: z.number()
        })

        global.fetch = vi.fn().mockResolvedValue({
            status: 201,
            json: vi.fn().mockResolvedValue({ id: 1 })
        })

        const endpoint = new Endpoint({
            method: "POST",
            path: () => "/api/users",
            successCodes: [StatusCode.CREATED],
            schema
        })

        const body = { name: "Alice", age: 30 }
        await endpoint.fetch({ body })

        expect(global.fetch).toHaveBeenCalledWith("/api/users", {
            body: JSON.stringify(body),
            headers: {},
            method: "POST"
        })
    })

    it("should handle NO_CONTENT response", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 204
        })

        const endpoint = new Endpoint({
            method: "DELETE",
            path: () => "/api/users/1",
            successCodes: [StatusCode.NO_CONTENT]
        })

        const result = await endpoint.fetch({})

        expect(result).toBeNull()
    })

    it("should handle blob response type", async () => {
        const mockBlob = new Blob(["content"])
        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            blob: vi.fn().mockResolvedValue(mockBlob)
        })

        const endpoint = new Endpoint({
            method: "GET",
            path: () => "/api/file",
            successCodes: [StatusCode.OK],
            responseType: "blob"
        })

        const result = await endpoint.fetch({})

        expect(result).toBe(mockBlob)
    })

    it("should merge custom fetch options", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            json: vi.fn().mockResolvedValue({})
        })

        const endpoint = new Endpoint({
            method: "GET",
            path: () => "/api/data",
            successCodes: [StatusCode.OK]
        })

        await endpoint.fetch({
            fetchOptions: {
                headers: { Authorization: "Bearer token" },
                signal: new AbortController().signal
            }
        })

        expect(global.fetch).toHaveBeenCalledWith("/api/data", {
            body: undefined,
            headers: { Authorization: "Bearer token" },
            method: "GET",
            signal: expect.any(AbortSignal)
        })
    })
})

describe("fetch method - error handling", () => {
    it("should return FetchError for invalid path arguments", async () => {
        const endpoint = new Endpoint({
            method: "GET",
            path: (id: number) => {
                if (typeof id !== "number") throw new Error("Invalid")
                return `/api/users/${id}`
            },
            successCodes: [StatusCode.OK]
        })

        // @ts-expect-error Intentionally invalid.
        const result = await endpoint.fetch({ pathArgs: ["invalid"] })

        expect(result).toBeInstanceOf(FetchError)
        expect((result as FetchError).message).toContain("Invalid path arguments")
    })

    it("should return FetchError for invalid body schema", async () => {
        const schema = z.object({ name: z.string() })

        const endpoint = new Endpoint({
            method: "POST",
            path: () => "/api/users",
            successCodes: [StatusCode.CREATED],
            schema
        })

        // @ts-expect-error Intentionally invalid.
        const result = await endpoint.fetch({ body: { name: 123 } })

        expect(result).toBeInstanceOf(FetchError)
        expect((result as FetchError).message).toBe("Invalid body.")
    })

    it("should return FetchError when fetch throws", async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error("Network error"))

        const endpoint = new Endpoint({
            method: "GET",
            path: () => "/api/users",
            successCodes: [StatusCode.OK]
        })

        const result = await endpoint.fetch({})

        expect(result).toBeInstanceOf(FetchError)
        expect((result as FetchError).message).toBe("Network error")
    })

    it("should return FetchError for unexpected status code", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 404,
            json: vi.fn()
        })

        const endpoint = new Endpoint({
            method: "GET",
            path: () => "/api/users",
            successCodes: [StatusCode.OK]
        })

        const result = await endpoint.fetch({})

        expect(result).toBeInstanceOf(FetchError)
        expect((result as FetchError).message).toContain("Invalid status 404")
        expect((result as FetchError).status).toBe(404)
    })

    it("should return FetchError when response parsing fails", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            status: 200,
            json: vi.fn().mockRejectedValue(new Error("Parse error"))
        })

        const endpoint = new Endpoint({
            method: "GET",
            path: () => "/api/users",
            successCodes: [StatusCode.OK]
        })

        const result = await endpoint.fetch({})

        expect(result).toBeInstanceOf(FetchError)
        expect((result as FetchError).message).toBe("Failed to parse response.")
    })

    it("should handle unknown error types", async () => {
        global.fetch = vi.fn().mockRejectedValue("string error")

        const endpoint = new Endpoint({
            method: "GET",
            path: () => "/api/users",
            successCodes: [StatusCode.OK]
        })

        const result = await endpoint.fetch({})

        expect(result).toBeInstanceOf(FetchError)
        expect((result as FetchError).message).toBe("Unknown error ocurred.")
    })
})
