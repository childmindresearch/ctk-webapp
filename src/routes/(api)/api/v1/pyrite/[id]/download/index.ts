import { Endpoint, StatusCode } from "$lib/utils"

export type GetPyriteResponse = Blob

const path = (id: string | number) => `/api/v1/pyrite/${id}/download`

export const GetPyriteDownload = new Endpoint<GetPyriteResponse, typeof path>({
    method: "GET",
    path,
    successCodes: [StatusCode.OK],
    responseType: "blob"
})
