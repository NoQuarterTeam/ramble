import { prisma } from "@ramble/database"
import type { Role } from "@ramble/database/types"

// async function main() {
//   const users = await prisma.user.findMany({ include: { accessRequest: true } })
//   const contacts = users.map(
//     (item) =>
//       ({
//         email: item.email,
//         userId: item.id,
//         signedUpAt: item.createdAt,
//         accessRequestedAt: item.accessRequest?.createdAt || undefined,
//       }) satisfies LoopsContact,
//   )

//   for (const contact of contacts) {
//     await updateLoopsContact(contact)
//   }

//   return
// }
async function main() {
  const acccessRequests = await prisma.accessRequest.findMany({ include: { user: true } })
  const contacts = acccessRequests.map(
    (ar) =>
      ({
        email: ar.user ? ar.email : ar.email,
        accessRequestAcceptedAt: ar.acceptedAt || undefined,
      }) satisfies LoopsContact,
  )

  for (const contact of contacts) {
    updateLoopsContact(contact)
  }

  return
}

main()
  .then(() => {
    console.log("Done!")
  })
  .catch((e) => {
    console.error(e)
  })
  .finally(() => {
    prisma.$disconnect()
    process.exit(0)
  })

type RequiredIdOrEmail = { userId: string; email?: string } | { userId?: string; email: string }

export type LoopsContact = RequiredIdOrEmail & {
  firstName?: string
  lastName?: string
  notes?: string
  source?: string
  userGroup?: string
  // custom
  accessRequestedAt?: Date
  accessRequestAcceptedAt?: Date
  signedUpAt?: Date
  inviteCode?: string
  isVerified?: boolean
  role?: Role
  isAdmin?: boolean
}

const API_URL = "https://app.loops.so/api/v1"

const defaultOptions = {
  headers: { Authorization: "Bearer 0d3fdb68a71eb59b20f21adab26acc25", "Content-Type": "application/json" },
}

type LoopsContactResponse =
  | { success: true; id: string }
  | { success: false; message: string }
  | { success: false; error: string }

export async function updateLoopsContact(contact: LoopsContact) {
  try {
    const formattedData = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      notes: contact.notes,
      source: contact.source,
      userGroup: contact.userGroup,
      inviteCode: contact.inviteCode,
      isVerified: contact.isVerified,
      userId: contact.userId!,
      email: contact.email!,
      role: contact.role,
      isAdmin: contact.isAdmin,
      signedUpAt: contact.signedUpAt,
      accessRequestedAt: contact.accessRequestedAt,
      accessRequestAcceptedAt: contact.accessRequestAcceptedAt,
    } satisfies LoopsContact

    const options = {
      ...defaultOptions,
      method: "PUT",
      body: JSON.stringify(formattedData),
    }
    const res = (await fetch(`${API_URL}/contacts/update`, options).then((response) => response.json())) as LoopsContactResponse
    if (!res.success) throw res
  } catch (error) {
    console.log(error)
  }
}
