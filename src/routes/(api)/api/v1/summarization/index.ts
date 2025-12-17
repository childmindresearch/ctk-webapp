import { Endpoint, StatusCode } from "$lib/utils"
import { z } from "zod"

export const reportSummaryRequestSchema = z.object({
    patient_name: z.string(),
    text_content: z.string()
})
export type ReportSummaryRequest = z.infer<typeof reportSummaryRequestSchema>

const path = () => "/api/v1/summarization"
/**
 * Endpoint to generate a summary report document.
 * Use the .fetch() method to run the query.
 * Expects a JSON body with necessary data for the report.
 */
export const PostSummarization = new Endpoint<Blob, typeof path>({
    method: "POST",
    path,
    successCodes: [StatusCode.OK]
})
