import LoopsClient from "loops"

import { type Role } from "@ramble/database/types"
import { env } from "@ramble/server-env"

const loops = new LoopsClient(env.LOOPS_API_KEY)

export type LoopsContact = {
  email: string
  userId?: string
  firstName?: string
  lastName?: string
  notes?: string
  source?: string
  userGroup?: string
  // custom
  inviteCode?: string
  isVerified?: boolean
  role?: Role
  isAdmin?: boolean
  signedUpAt?: Date
  accessRequestedAt?: Date
  accessRequestAcceptedAt?: Date
}

// if changing email, make sure to pass userId
export async function updateLoopsContact(contact: LoopsContact) {
  try {
    const formattedData = {
      email: contact.email,
      firstName: contact.firstName,
      lastName: contact.lastName,
      notes: contact.notes,
      source: contact.source,
      userGroup: contact.userGroup,
      inviteCode: contact.inviteCode,
      isVerified: contact.isVerified,
      userId: contact.userId,
      role: contact.role,
      isAdmin: contact.isAdmin,
      signedUpAt: contact.signedUpAt,
      accessRequestedAt: contact.accessRequestedAt,
      accessRequestAcceptedAt: contact.accessRequestAcceptedAt,
    } satisfies LoopsContact
    const res = await loops.updateContact(contact.email, formattedData)
    if (!res.success) throw res
  } catch (error) {
    console.log(error)
  }
}

export async function deleteLoopsContact(contact: Partial<Pick<LoopsContact, "email" | "userId">>) {
  try {
    const res = await loops.deleteContact(contact)
    if (!res.success) throw res
  } catch (error) {
    console.log(error)
  }
}
