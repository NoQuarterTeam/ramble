import { SignJWT, jwtVerify } from "jose"
import { APP_SECRET } from "./config.server"

type Payload = Record<string, unknown>

const secret = new TextEncoder().encode(APP_SECRET)
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
    throw error
  }
}

export async function decryptToken<T>(token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: [alg] })
    return payload as T
  } catch (error) {
    // Oops
    throw error
  }
}
