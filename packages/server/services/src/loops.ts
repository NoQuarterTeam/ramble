import * as Sentry from "@sentry/nextjs"
import LoopsClient from "loops"

import type { Role } from "@ramble/database/types"
import { IS_PRODUCTION, env } from "@ramble/server-env"

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
  signedUpAt?: string
  accessRequestedAt?: string
  accessRequestAcceptedAt?: string
}

// if changing email, make sure to pass userId
export async function updateLoopsContact(contact: LoopsContact) {
  if (!IS_PRODUCTION) return
  try {
    const formattedData: NonNullable<LoopsContact> = {
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
    }

    const res = await loops.updateContact(contact.email, formattedData)
    if (!res.success) throw res
  } catch (error) {
    Sentry.captureException(error)
  }
}

export async function deleteLoopsContact(contact: Partial<Pick<LoopsContact, "email" | "userId">>) {
  if (!IS_PRODUCTION) return
  try {
    const res = await loops.deleteContact(contact)
    if (!res.success) throw res
  } catch (error) {
    Sentry.captureException(error)
  }
}
