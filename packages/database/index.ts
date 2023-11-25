import { connect } from "@planetscale/database"
import { PrismaPlanetScale } from "@prisma/adapter-planetscale"
import { PrismaClient } from "@prisma/client"
import { env } from "@ramble/server-env"

const connection = connect({ url: env.DATABASE_URL })
const adapter = new PrismaPlanetScale(connection)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter, log: ["query"] })
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
