import { z } from "zod"

// Only use on the server
const envSchema = z.object({
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  RESEND_API_KEY: z.string(),
  VERCEL_ENV: z.enum(["development", "production", "preview"]).optional(),
  VERCEL_GIT_COMMIT_REF: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  FLICKR_ACCESS_KEY: z.string(),
  FLICKR_SECRET_KEY: z.string(),
})

export const {
  AWS_ACCESS_KEY_ID,
  RESEND_API_KEY,
  AWS_SECRET_ACCESS_KEY,
  VERCEL_ENV,
  VERCEL_GIT_COMMIT_REF,
  VERCEL_URL,
  FLICKR_ACCESS_KEY,
  FLICKR_SECRET_KEY,
} = envSchema.parse(process.env)
