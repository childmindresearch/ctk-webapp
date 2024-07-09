import { AZURE_BLOB_ACCOUNT_NAME, AZURE_BLOB_SAS } from "./environment"
import { logger } from "./logging"

if (!AZURE_BLOB_ACCOUNT_NAME || !AZURE_BLOB_SAS) {
    logger.error("Azure environment variables not set")
    throw new Error("Azure environment variables not set")
}

export class AzureStorage {
    private urlTemplate

    constructor() {
        this.urlTemplate = `https://${AZURE_BLOB_ACCOUNT_NAME}.blob.core.windows.net/{container}/{blob}?${AZURE_BLOB_SAS}`
    }

    async putBlob(containerName: string, blobName: string, content: string | Buffer) {
        const url = this.urlTemplate.replace("{container}", containerName).replace("{blob}", blobName)
        const headers = new Headers({
            "Content-Type": "application/octet-stream"
        })
        const body = content instanceof Buffer ? content : Buffer.from(content)
        return await fetch(url, {
            method: "PUT",
            headers: headers,
            body: body
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Failed to create blob: ${response.statusText}`)
            }
        })
    }

    async readBlob(containerName: string, blobName: string) {
        const url = this.urlTemplate.replace("{container}", containerName).replace("{blob}", blobName)
        return await fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to read blob: ${response.statusText}`)
                }
                return response
            })
            .then(async response => await response.blob())
            .then(blob => blob.arrayBuffer())
    }
}
