import { Client } from "@planetscale/database"
import { PrismaPlanetScale } from "@prisma/adapter-planetscale"
import { PrismaClient } from "@prisma/client"
import { env } from "@ramble/server-env"
import { createSpotNanoId } from "./nanoid"

const client = new Client({ url: env.DATABASE_URL })

const adapter = new PrismaPlanetScale(client)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter, log: ["query"] })
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(!env.DATABASE_URL.includes("127.0.0.1") ? { adapter } : undefined).$extends({
    query: {
      spot: {
        create: ({ query, args }) => {
          const id = createSpotNanoId()
          return query({ ...args, data: { ...args.data, nanoid: id } })
        },
        upsert: ({ query, args }) => {
          const id = createSpotNanoId()
          return query({ ...args, create: { ...args.create, nanoid: id } })
        },
      },
    },
  })

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
