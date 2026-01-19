import { AZURE_FUNCTION_PYTHON_URL } from "../environment.js"
import type { paths } from "./types.js"
import createClient from "openapi-fetch"

export const ctkFunctionsClient = createClient<paths>({ baseUrl: AZURE_FUNCTION_PYTHON_URL })
