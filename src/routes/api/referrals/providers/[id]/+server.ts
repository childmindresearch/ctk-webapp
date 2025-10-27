import { db } from "$lib/server/db"
import { referralProviders, referralAddresses } from "$lib/server/db/schema"
import { logger } from "$lib/server/logging"
import { json } from "@sveltejs/kit"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { getProviders } from "../../crud"
import { createProviderSchema } from "../schemas"

export async function GET({ params }) {
  const id = Number(params.id)
  try {
    const provider = (await getProviders([id]))[0]
    return json(provider)
  } catch (error) {
    logger.error(`Error fetching provider ${id}:`, error)
    return new Response("Could not fetch provider.", { status: 500 })
  }
}

export async function DELETE({ params }) {
  const id = Number(params.id)
  try {
    await db.delete(referralProviders).where(eq(referralProviders.id, id))
    return new Response(null, { status: 200 })
  } catch (error) {
    logger.error(`Error deleting provider ${id}`, error)
    return new Response("Could not delete provider.", { status: 500 })
  }
}

export async function PUT({ params, request }) {
  const id = Number(params.id)
  const providerData = await request.json()

  let providerRequest: z.infer<typeof createProviderSchema>
  try {
    providerRequest = createProviderSchema.parse(providerData)
  } catch (error) {
    logger.error("Invalid provider data format", error)
    return new Response(JSON.stringify({ error: "Invalid request format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    await db.transaction(async tx => {
      await tx.update(referralProviders).set(providerRequest).where(eq(referralProviders.id, id))
      await tx.delete(referralAddresses).where(eq(referralAddresses.providerId, id))
      if (providerRequest.addresses && providerRequest.addresses.length > 0) {
        const addresses = providerRequest.addresses.map(address => ({
          ...address,
          providerId: id
        }))
        await tx.insert(referralAddresses).values(addresses)
      }
    })

    const updatedProvider = (await getProviders([id]))[0]
    return json(updatedProvider)
  } catch (error) {
    logger.error(`Error updating provider ${id}:`, error)
    return new Response(JSON.stringify({ error: "Failed to update provider" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
