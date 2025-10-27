import { logger } from "$lib/server/logging"
import { AZURE_FUNCTION_PYTHON_URL } from "$lib/server/environment"

export async function GET({ params, fetch }) {
  const id = params.id
  logger.info(`Getting Pyrite report with id ${id}.`)
  return await fetch(`${AZURE_FUNCTION_PYTHON_URL}/pyrite/${id}`)
    .then(async response => {
      if (response.ok && response.body) {
        return new Response(response.body)
      } else {
        throw new Error(await response.text())
      }
    })
    .catch(error => {
      logger.error(`Error getting intake with id ${id}: ${error}`)
      return new Response(error, { status: 500 })
    })
}
