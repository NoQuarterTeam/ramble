import crypto from "node:crypto"
import { prisma } from "@ramble/database"
import { Prisma } from "@ramble/database/server"
import * as Sentry from "@sentry/nextjs"

let count = 0
export async function createAccessRequest(
  email: string,
): Promise<{ success: true; code: string } | { success: false; code?: undefined }> {
  try {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase().padEnd(8, "5")
    await prisma.accessRequest.create({ data: { email: email, code } })
    return { success: true, code }
  } catch (error) {
    if (count > 5) {
      Sentry.captureException(error)
      return { success: false }
    }
    count++
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      error.message.includes("AccessRequest_code_key")
    ) {
      return createAccessRequest(email)
    }
    throw error
  }
}
