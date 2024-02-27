import { SignJWT, jwtVerify } from "jose"

import { env } from "@ramble/server-env"

type Payload = Record<string, unknown>

const secret = new TextEncoder().encode(env.APP_SECRET)
const alg = "HS256"
export const createToken = async (payload: Payload) => {
  try {
    const token = await new SignJWT(payload)
      .setIssuer("@ramble")
      .setIssuedAt()
      .setExpirationTime("4w")
      .setProtectedHeader({ alg })
      .sign(secret)
    return token
  } catch (error) {
    // Oops
    console.log(error)
    throw error
  }
}

export async function decryptToken<T>(token: string) {
  try {
    const { payload } = await jwtVerify<T>(token, secret, { algorithms: [alg] })
    return payload
  } catch (error) {
    // Oops
    console.log(error)
    throw error
  }
}
