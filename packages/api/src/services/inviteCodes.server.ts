import { v4 } from "uuid"

export function generateInviteCodes(userId: string) {
  const prefix = userId.slice(0, 4)
  return Array.from({ length: 10 }).map(() => (prefix + v4().slice(0, 4)).toUpperCase())
}
