import { VERCEL_ENV, VERCEL_URL } from "./env"

export const IS_PRODUCTION = VERCEL_ENV === "production" || VERCEL_ENV === "preview"
// WEB URL
export const FULL_WEB_URL = !VERCEL_URL ? "http://localhost:3000" : `https://${VERCEL_URL}`
