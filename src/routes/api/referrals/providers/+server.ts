import { logger } from "$lib/server/logging.js"
import { json } from "@sveltejs/kit"
import { getProviders } from "$api/referrals/crud.js"
import { z } from "zod"
import { db } from "$lib/server/db/index.js"
import { referralProviders, referralAddresses } from "$lib/server/db/schema"
import { createProviderSchema } from "./schemas.js"
import { StatusCode } from "$lib/utils.js"

export async function GET() {
  logger.info("Getting all providers.")
  try {
    return json(await getProviders())
  } catch (error) {
    logger.error("Error fetching providers:", error)
    return new Response("Could not fetch providers.", { status: 500 })
  }
}

export async function POST({ request }) {
  logger.info("Creating new provider with sub-services.")

  try {
    const body = await request.json()
    const validatedData = createProviderSchema.parse(body)

    const providerId = await db.transaction(async tx => {
      const [provider] = await tx
        .insert(referralProviders)
        .values({
          ...validatedData,
          acceptsInsurance: validatedData.insuranceDetails !== null && validatedData.insuranceDetails !== undefined
        } as typeof referralProviders.$inferInsert)
        .returning()

      if (validatedData.addresses.length > 0) {
        await tx.insert(referralAddresses).values(
          validatedData.addresses.map(
            addr =>
              ({
                providerId: provider.id,
                ...addr
              }) as typeof referralAddresses.$inferInsert
          )
        )
      }
      return provider.id
    })

    const completeProvider = await getProviders([providerId])

    logger.info(`Successfully created provider: ${validatedData.name}`)
    return json(completeProvider, { status: StatusCode.CREATED })
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error("Validation error:", error.errors)
      return json(
        {
          error: "Validation failed",
          details: error.errors
        },
        { status: StatusCode.BAD_REQUEST }
      )
    }

    logger.error("Error creating provider:", error)
    return new Response("Could not create provider.", { status: StatusCode.INTERNAL_SERVER_ERROR })
  }
}
