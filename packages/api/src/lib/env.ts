import { z } from "zod"

// Only use on the server
const envSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
})

export const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = envSchema.parse(process.env)
