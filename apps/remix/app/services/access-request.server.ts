import crypto from "crypto"

import { Prisma } from "@ramble/database/types"
import { db } from "~/lib/db.server"

let count = 0
export async function createAccessRequest(email: string) {
  try {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase().padEnd(8, "5")
    await db.accessRequest.create({ data: { email: email, code } })
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
