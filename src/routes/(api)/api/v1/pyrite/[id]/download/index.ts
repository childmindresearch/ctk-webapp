import { Endpoint, StatusCode } from "$lib/utils"

export type GetPyriteResponse = Blob

const path = (id: string | number) => `/api/v1/pyrite/${id}/download`

/**
 * Endpoint to download a Pyrite report as a DOCX file for a given ID.
 * Use the .fetch() method to run the query.
 */
export const GetPyriteDownload = new Endpoint<GetPyriteResponse, typeof path>({
    method: "GET",
    path,
    successCodes: [StatusCode.OK],
    responseType: "blob"
})
