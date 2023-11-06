import crypto from "crypto"

import { Prisma } from "@ramble/database/types"
import { prisma } from "@ramble/database"

let count = 0
export async function createAccessRequest(email: string) {
  try {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase().padEnd(8, "5")
    await prisma.accessRequest.create({ data: { email: email, code } })
    return true
  } catch (error) {
    if (count > 5) return false
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
