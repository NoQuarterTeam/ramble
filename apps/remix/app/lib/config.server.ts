import { NODE_ENV, VERCEL_ENV, VERCEL_GIT_COMMIT_REF, VERCEL_URL } from "./env.server"

export const IS_PRODUCTION = VERCEL_ENV === "production"
export const IS_PREVIEW = VERCEL_ENV === "preview"
export const IS_DEV = NODE_ENV === "development"

export const ENV: "development" | "preview" | "production" = IS_DEV ? "development" : IS_PREVIEW ? "preview" : "production"

// WEB URL
export const FULL_WEB_URL =
  NODE_ENV === "development"
    ? "http://localhost:3000"
    : IS_PREVIEW
      ? `https://${VERCEL_GIT_COMMIT_REF === "develop" ? "dev.ramble.guide" : VERCEL_URL}`
      : `https://ramble.guide`
