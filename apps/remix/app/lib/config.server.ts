import { z } from "zod"

// Only use on the server
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]),
  VERCEL_ENV: z.enum(["development", "production", "preview"]).optional(),
  VERCEL_URL: z.string().optional(),
  APP_SECRET: z.string(),
  SESSION_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  FLASH_SESSION_SECRET: z.string(),
  THEME_SESSION_SECRET: z.string(),
  AWS_ACCESS_KEY_USER: z.string(),
  AWS_SECRET_KEY_USER: z.string(),
})

export const {
  NODE_ENV,
  VERCEL_ENV,
  APP_SECRET,
  SESSION_SECRET,
  RESEND_API_KEY,
  FLASH_SESSION_SECRET,
  THEME_SESSION_SECRET,
  VERCEL_URL,
  AWS_ACCESS_KEY_USER,
  AWS_SECRET_KEY_USER,
} = envSchema.parse(process.env)

export const IS_PRODUCTION = VERCEL_ENV === "production"
// WEB URL
export const FULL_WEB_URL = !VERCEL_URL ? "http://localhost:3000" : `https://${VERCEL_URL}`
