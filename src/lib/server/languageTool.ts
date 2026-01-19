import { logger } from "$lib/server/logging"
import { LANGUAGETOOL_URL } from "$lib/server/environment"
import z from "zod"

const ReplacementSchema = z.object({
    value: z.string(),
    shortDescription: z.string().optional()
})

const ContextSchema = z.object({
    text: z.string(),
    offset: z.number(),
    length: z.number()
})

const TypeSchema = z.object({
    typeName: z.string()
})

const CategorySchema = z.object({
    id: z.string(),
    name: z.string()
})

const RuleSchema = z.object({
    id: z.string(),
    description: z.string(),
    issueType: z.string(),
    category: CategorySchema,
    isPremium: z.boolean().optional(),
    subId: z.string().optional(),
    sourceFile: z.string().optional(),
    urls: z.array(z.object({ value: z.string() })).optional()
})

const DetectedLanguageSchema = z.object({
    name: z.string().optional(),
    code: z.string().optional(),
    confidence: z.number().optional()
})

export const LanguageToolResponseSchema = z.object({
    software: z.object({
        name: z.string(),
        version: z.string(),
        buildDate: z.string(),
        apiVersion: z.number(),
        premium: z.boolean(),
        premiumHint: z.string(),
        status: z.string()
    }),
    warnings: z.object({
        incompleteResults: z.boolean()
    }),
    language: z.object({
        name: z.string(),
        code: z.string(),
        detectedLanguage: z.object({
            name: z.string(),
            code: z.string(),
            confidence: z.number(),
            source: z.string()
        })
    }),
    matches: z.array(
        z.object({
            message: z.string(),
            shortMessage: z.string(),
            replacements: z.array(ReplacementSchema),
            offset: z.number(),
            length: z.number(),
            context: ContextSchema,
            sentence: z.string(),
            type: TypeSchema,
            rule: RuleSchema,
            ignoreForIncompleteSentence: z.boolean(),
            contextForSureMatch: z.number()
        })
    ),
    sentenceRanges: z.array(z.tuple([z.number(), z.number()])),
    extendedSentenceRanges: z.array(
        z.object({
            from: z.number(),
            to: z.number(),
            detectedLanguages: z.array(DetectedLanguageSchema)
        })
    )
})

export async function languageTool(
    text: string,
    language: string = "en-US"
): Promise<z.infer<typeof LanguageToolResponseSchema>> {
    logger.info("Running LanguageTool")

    const params = new URLSearchParams({
        text: text,
        language: language,
        enabledOnly: "false"
    })
    try {
        const response = await fetch(`${LANGUAGETOOL_URL}/v2/check`, {
            method: "POST",
            body: params,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        if (response.ok) {
            const body = await response.json()
            return LanguageToolResponseSchema.parse(body)
        }
        const errorText = await response.text()
        logger.error("LanguageTool API error:", errorText)
        throw new Error(`LanguageTool API error: ${errorText}`)
    } catch (err) {
        logger.error("Error processing LanguageTool request:", err)
        throw new Error("Internal server error processing text", { cause: err })
    }
}
