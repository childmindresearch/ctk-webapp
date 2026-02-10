import { describe, it, expect } from "vitest"
import { replaceTemplates } from "./controller"

describe("replaceTemplates", () => {
    it("should replace template spans with their corresponding values", () => {
        const html = `
      <div>
        Hello, <span data-extension-type="template" data-name="user_name">Placeholder</span>!
      </div>
    `
        const replacements = { user_name: "Lea" }

        const result = replaceTemplates(html, replacements)

        expect(result).toContain("<span>Lea</span>")
        expect(result).not.toContain('data-extension-type="template"')
        expect(result).not.toContain("Placeholder")
    })

    it("should handle multiple replacements in the same string", () => {
        const html = `
      <span data-extension-type="template" data-name="greeting">Hi</span>, 
      <span data-extension-type="template" data-name="name">User</span>
    `
        const replacements = { greeting: "Hello", name: "Kenobi" }

        const result = replaceTemplates(html, replacements)

        expect(result).toContain("<span>Hello</span>")
        expect(result).toContain("<span>Kenobi</span>")
    })

    it("should not replace anything if data-name is missing from replacements", () => {
        const html = '<span data-extension-type="template" data-name="unknown">Keep Me</span>'
        const replacements = { user_name: "Lea" }

        const result = replaceTemplates(html, replacements)

        expect(result).toContain('data-name="unknown"')
        expect(result).toContain("Keep Me")
    })

    it("should ignore spans that do not have the template data-extension-type", () => {
        const html = '<span data-name="user_name">Normal Span</span>'
        const replacements = { user_name: "Lea" }

        const result = replaceTemplates(html, replacements)

        expect(result).toContain("Normal Span")
        expect(result).not.toContain("<span>Alice</span>")
    })
})
