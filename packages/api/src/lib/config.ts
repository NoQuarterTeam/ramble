import { VERCEL_ENV, VERCEL_GIT_COMMIT_REF, VERCEL_URL } from "./env"

export const IS_PRODUCTION = VERCEL_ENV === "production"
export const IS_PREVIEW = VERCEL_ENV === "preview"
export const IS_DEV = !VERCEL_ENV

// WEB URL
export const FULL_WEB_URL = IS_DEV
  ? "http://localhost:3000"
  : IS_PREVIEW
  ? `https://${VERCEL_GIT_COMMIT_REF === "develop" ? "dev.ramble.guide" : VERCEL_URL}`
  : `https://ramble.guide`
