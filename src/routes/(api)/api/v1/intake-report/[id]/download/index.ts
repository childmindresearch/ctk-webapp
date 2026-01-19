import { Endpoint, StatusCode } from "$lib/utils"

export type GetIntakeResponse = Blob

const path = (id: string | number) => `/api/v1/intake-report/${id}/download`

/**
 * Endpoint to download an intake report as a DOCX file for a given ID.
 * Use the .fetch() method to run the query.
 */
export const GetIntakeDownload = new Endpoint<GetIntakeResponse, typeof path>({
    method: "GET",
    path,
    successCodes: [StatusCode.OK],
    responseType: "blob"
})
