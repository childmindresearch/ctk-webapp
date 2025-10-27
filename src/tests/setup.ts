import "@testing-library/jest-dom"
import { vi } from "vitest"

Object.defineProperty(window, "matchMedia", {
  writable: true,
  enumerable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

vi.mock("lib/server/sql", async () => {
  return {
    pool: {
      connect: vi.fn().mockResolvedValue({ rows: [] })
    }
  }
})
