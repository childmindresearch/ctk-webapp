import { dev } from "$app/environment"
import { AZURE_FUNCTION_PYTHON_URL } from "../environment.js"
import type { paths } from "./types.js"
import createClient from "openapi-fetch"
import { Document, Packer } from "docx"

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
const mockClient = {
    GET: async (path: string) => {
        if (path === "/intake-report/{mrn}" || path === "/pyrite/{mrn}") {
            const doc = new Document({ sections: [] })
            const response = await Packer.toBlob(doc)
            await delay(2000)
            return { response: new Response(), data: response, error: undefined }
        }
        return { response: new Response(), data: undefined, error: { message: "Not implemented in mock" } }
    }
} as ReturnType<typeof createClient<paths>>

const realClient = createClient<paths>({ baseUrl: AZURE_FUNCTION_PYTHON_URL })

export const ctkFunctionsClient = dev ? mockClient : realClient
