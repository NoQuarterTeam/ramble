import type { Role } from "@ramble/database/types"
import { IS_PRODUCTION, env } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"
import { waitUntil } from "@vercel/functions"
import { LoopsClient } from "loops"

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
export function updateLoopsContact(contact: LoopsContact) {
  if (!IS_PRODUCTION) return
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
  waitUntil(loops.updateContact(contact.email, formattedData).catch(Sentry.captureException))
}

export function deleteLoopsContact(contact: Partial<Pick<LoopsContact, "email" | "userId">>) {
  if (!IS_PRODUCTION) return
  waitUntil(loops.deleteContact(contact).catch(Sentry.captureException))
}
