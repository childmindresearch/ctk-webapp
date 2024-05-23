import { AzureStorage } from "$lib/server/azure"
import { logger } from "$lib/server/logging"

export async function GET({ params }) {
    const name = decodeURIComponent(params.name)
    logger.info(`Retrieving file ${name} from Azure.`)
    const file = await new AzureStorage().readBlob("templates", name)
    if (!file) {
        return new Response(null, { status: 404 })
    }
    return new Response(file, {
        headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="${name}.docx"`
        }
    })
}

export async function PUT({ params, request }) {
    const name = decodeURIComponent(params.name)
    logger.info(`Saving file ${name} to Azure.`)
    const file = Buffer.from(await request.arrayBuffer())

    await new AzureStorage().putBlob("templates", name, file)
    return new Response(null, { status: 204 })
}
