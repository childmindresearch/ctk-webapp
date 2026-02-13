import { describe, it, expect } from "vitest"
import {
    isTextSegment,
    isTextSegmentArray,
    LanguageCorrectionCollector,
    rgbToHex,
    toHex,
    type TextSegment
} from "./html2docx"

const { mockLanguageTool } = vi.hoisted(() => ({ mockLanguageTool: vi.fn() }))
const MOCK_RULE_ID = "mock-rule"
const MOCK_RULE_SET = new Set([MOCK_RULE_ID])

vi.mock("$lib/server/languageTool", () => ({ languageTool: mockLanguageTool }))

describe("toHex", () => {
    it("should convert standard numbers to two-digit hex", () => {
        expect(toHex(0)).toBe("00")
        expect(toHex(255)).toBe("ff")
        expect(toHex(128)).toBe("80")
    })

    it("should pad single-digit hex results with a leading zero", () => {
        expect(toHex(10)).toBe("0a")
        expect(toHex(15)).toBe("0f")
    })

    it("should clamp values below 0 to 00", () => {
        expect(toHex(-10)).toBe("00")
    })

    it("should clamp values above 255 to ff", () => {
        expect(toHex(300)).toBe("ff")
    })
})

describe("rgbToHex", () => {
    it("should convert RGB triples to a hex string", () => {
        expect(rgbToHex(255, 255, 255)).toBe("#ffffff")
        expect(rgbToHex(0, 0, 0)).toBe("#000000")
        expect(rgbToHex(255, 0, 128)).toBe("#ff0080")
    })
})

describe("isTextSegment", () => {
    it("should return true for a valid TextSegment object", () => {
        const valid: TextSegment = {
            content: "CrossCode",
            formatting: { bold: true }
        }
        expect(isTextSegment(valid)).toBe(true)
    })

    it("should return true even if formatting is an empty object", () => {
        const valid = { content: "Test", formatting: {} }
        expect(isTextSegment(valid)).toBe(true)
    })

    it('should return false if "content" is missing', () => {
        const invalid = { formatting: { bold: true } }
        expect(isTextSegment(invalid)).toBe(false)
    })

    it('should return false if "formatting" is missing', () => {
        const invalid = { content: "Missing formatting" }
        expect(isTextSegment(invalid)).toBe(false)
    })

    it("should return false for null or non-object types", () => {
        // @ts-expect-error # Intentional error
        expect(isTextSegment(null)).toBe(false)
        // @ts-expect-error # Intentional error
        expect(isTextSegment("just a string")).toBe(false)
        // @ts-expect-error # Intentional error
        expect(isTextSegment(42)).toBe(false)
    })
})

describe("isTextSegmentArray", () => {
    it("should return true for an array of valid segments", () => {
        const segments: TextSegment[] = [
            { content: "One", formatting: {} },
            { content: "Two", formatting: { italics: true } }
        ]
        expect(isTextSegmentArray(segments)).toBe(true)
    })

    it("should return true for an empty array", () => {
        expect(isTextSegmentArray([])).toBe(true)
    })

    it("should return false if one element is invalid", () => {
        const mixed = [{ content: "Valid", formatting: {} }, { content: "Invalid because formatting is missing" }]
        expect(isTextSegmentArray(mixed)).toBe(false)
    })
})

describe("LanguageCorrectionCollector", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("should return an empty array if no segments are pushed", async () => {
        const collector = new LanguageCorrectionCollector(MOCK_RULE_SET)
        const result = await collector.collect()
        expect(result).toEqual([])
        expect(mockLanguageTool).not.toHaveBeenCalled()
    })

    it("should collect text, call languageTool, and apply corrections", async () => {
        const collector = new LanguageCorrectionCollector(MOCK_RULE_SET)
        collector.push({ content: "Hello ", formatting: {} }, { content: "worlde", formatting: { bold: true } })

        mockLanguageTool.mockResolvedValue({
            matches: [
                {
                    rule: { id: MOCK_RULE_ID },
                    offset: 6,
                    length: 6,
                    replacements: [{ value: "world" }]
                }
            ]
        })

        const result = await collector.collect()

        expect(result[1].content).toBe("world")
        expect(result[1].formatting.bold).toBe(true)
    })

    it("should ignore matches that are not in LANGUAGETOOL_RULES", async () => {
        const collector = new LanguageCorrectionCollector(MOCK_RULE_SET)
        collector.push({ content: "Incorrect", formatting: {} })

        mockLanguageTool.mockResolvedValue({
            matches: [
                {
                    rule: { id: "SOME_OTHER_RULE" },
                    offset: 0,
                    length: 9,
                    replacements: [{ value: "Correct" }]
                }
            ]
        })

        const result = await collector.collect()
        expect(result[0].content).toBe("Incorrect")
    })

    it("should handle corrections spanning multiple segments", async () => {
        const collector = new LanguageCorrectionCollector(MOCK_RULE_SET)
        collector.push(
            { content: "This ", formatting: {} },
            { content: "is ", formatting: {} },
            { content: "bad", formatting: {} }
        )

        mockLanguageTool.mockResolvedValue({
            matches: [
                {
                    rule: { id: MOCK_RULE_ID },
                    offset: 5,
                    length: 6,
                    replacements: [{ value: "is good" }]
                }
            ]
        })

        const result = await collector.collect()

        expect(result[1].content).toBe("is good")
        expect(result[2].content).toBe("")
    })
})
