import { z } from "zod"

/**
 *
 * @param model The model to validate with.
 * @param input The input string or object to validate.
 * @returns Validated object if validation is succesful, 400 response otherwise.
 */
export function zodValidateOr400<T extends z.ZodRawShape>(
    model: z.ZodObject<T>,
    input: string | object
): Response | z.infer<z.ZodObject<T>> {
    let parsedData: unknown
    try {
        parsedData = typeof input === "string" ? JSON.parse(input) : input
    } catch (error) {
        return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
        })
    }

    const validationResult = model.safeParse(parsedData)

    if (!validationResult.success) {
        return new Response(
            JSON.stringify({
                error: "Invalid provider request format",
                details: validationResult.error.errors
            }),
            {
                status: 400,
                headers: { "Content-Type": "application/json" }
            }
        )
    }
    return validationResult.data
}

export function isModel<T extends z.ZodSchema>(model: T, obj: unknown): obj is z.infer<T> {
    return model.safeParse(obj).success
}
