import { z } from "./vendor/zod.server"

// Only use on the server
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).optional(),
  VERCEL_ENV: z.enum(["development", "production", "preview"]).optional(),
  VERCEL_GIT_COMMIT_REF: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  APP_SECRET: z.string(),
  DATABASE_URL: z.string(),
  IPAPI_KEY: z.string(),
  SESSION_SECRET: z.string(),
  FLASH_SESSION_SECRET: z.string(),
  THEME_SESSION_SECRET: z.string(),
})

export const {
  NODE_ENV,
  VERCEL_ENV,
  APP_SECRET,
  IPAPI_KEY,
  SESSION_SECRET,
  FLASH_SESSION_SECRET,
  THEME_SESSION_SECRET,
  VERCEL_GIT_COMMIT_REF,

  VERCEL_URL,
} = envSchema.parse(process.env)
