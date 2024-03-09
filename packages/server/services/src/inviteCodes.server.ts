import crypto from "node:crypto"

const NUMBER_TO_GENERATE = 10
export function generateInviteCodes(userId: string) {
  const prefix = userId.slice(0, 4)
  return Array.from({ length: NUMBER_TO_GENERATE }).map(() => (prefix + crypto.randomUUID().slice(0, 4)).toUpperCase())
}
