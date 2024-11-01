import { PrismaClient } from "@prisma/client"
import { env } from "@ramble/server-env"
import { createSpotNanoId } from "./nanoid"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends({
    query: {
      spot: {
        create: ({ query, args }) => {
          const nanoid = createSpotNanoId()
          return query({ ...args, data: { ...args.data, nanoid } })
        },
        upsert: ({ query, args }) => {
          const nanoid = createSpotNanoId()
          return query({ ...args, create: { ...args.create, nanoid } })
        },
      },
    },
  })

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
