import { env } from "@ramble/server-env"
import jwt from "jsonwebtoken"
import { z } from "zod"

export function createToken<T extends object | string>(payload: T, expiresIn = "1 week") {
  const token = jwt.sign(payload, env.APP_SECRET, {
    issuer: "@ramble/api",
    audience: ["@ramble/app", "@ramble/web"],
    expiresIn,
  })
  return token
}

export function decodeToken<T>(token: string): T | null {
  try {
    jwt.verify(token, env.APP_SECRET)
    const payload = jwt.decode(token) as T
    return payload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log("Token expired")
      return null
    }
    throw error
  }
}

export const createAuthToken = (payload: { id: string }) => {
  try {
    const token = jwt.sign(payload, env.SESSION_SECRET, {
      issuer: "@ramble/api",
      audience: ["@ramble/app"],
      expiresIn: "8 weeks",
    })
    return token
  } catch (error) {
    // Oops
    console.log(error)
    throw error
  }
}
const authSchema = z.object({
  id: z.string(),
})

export function decodeAuthToken(token: string): { id: string } | null {
  try {
    jwt.verify(token, env.SESSION_SECRET)
    const payload = jwt.decode(token)
    const result = authSchema.parse(payload)
    return result
  } catch (error) {
    console.log(error)
    return null
  }
}
