import z from "zod"

const PostFilterSetSchema = z.object({
  name: z.string(),
  locations: z.array(z.string()),
  services: z.array(z.string())
})

export const PostFilterGroup = z.object({
  name: z.string(),
  filterSets: z.array(PostFilterSetSchema)
})
