import { logger } from "$lib/server/logging"
import { AzureStorage } from "$lib/server/azure"

export async function GET({ params }) {
    const name = decodeURIComponent(params.name)
    logger.info(`Retriving file ${name} from WOPI server.`)
    const response = await new AzureStorage().readBlob("templates", name)
    const filesize = response.byteLength
    return new Response(
        JSON.stringify({
            BaseFileName: name,
            Size: filesize,
            OwnerId: 1000,
            UserId: 1000,
            UserCanWrite: true
        })
    )
}
