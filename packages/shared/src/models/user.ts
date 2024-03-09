import type { Prisma } from "@ramble/database/types"
export const userInterestFields = {
  isSurfer: true,
  isClimber: true,
  isHiker: true,
  isMountainBiker: true,
  isPetOwner: true,
  isPaddleBoarder: true,
} satisfies Prisma.UserSelect
