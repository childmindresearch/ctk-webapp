import { Endpoint, StatusCode } from "$lib/utils"

export type GetIntakeResponse = Blob

const path = (id: string | number) => `/api/v1/intake-report/${id}/download`

export const GetIntakeDownload = new Endpoint<GetIntakeResponse, typeof path>({
    method: "GET",
    path,
    successCodes: [StatusCode.OK],
    responseType: "blob"
})
