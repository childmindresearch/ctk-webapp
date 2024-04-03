import { handle } from "../src/hooks.server"
import { describe, it, expect, vi } from "vitest"

function createEvent() {
    return {
        request: {
            headers: new Map(),
            method: "GET",
            url: "https://example.com"
        }
    }
}

function createResolve() {
    return vi.fn().mockResolvedValue({
        status: 200,
        headers: {
            append: vi.fn(),
            get: vi.fn(),
            set: vi.fn()
        }
    })
}

describe("handle requests", () => {
    it("should set request headers and log request information", async () => {
        const event = createEvent()
        const resolve = createResolve()

        const response = await handle({ event, resolve })

        expect(event.request.headers.get("X-Request-ID")).toBeDefined()
        expect(event.request.headers.get("X-User")).toBe("development.user@example.com")
        expect(resolve).toHaveBeenCalledWith(event)
        expect(response.headers.append).toHaveBeenCalledWith("X-Request-ID", expect.any(String))
    })
})
