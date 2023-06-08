import { TRPCError } from "@trpc/server"

import { z } from "zod"
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc"
import { updateSchema } from "../schemas/user"
import { Spot, SpotImage } from "@ramble/database/types"

const publicProfileProcedure = publicProcedure.input(z.object({ username: z.string() })).use(async ({ ctx, next, input }) => {
  const currentUser = ctx.user
  if (!input) throw new TRPCError({ code: "BAD_REQUEST" })
  const user = await ctx.prisma.user.findUnique({
    where: { username: input.username },
    select: { isProfilePublic: true, id: true },
  })
  if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
  if (!user.isProfilePublic && (!currentUser || currentUser.id !== user.id)) throw new TRPCError({ code: "UNAUTHORIZED" })
  return next({ ctx: { publicUser: user } })
})

export const userRouter = createTRPCRouter({
  profile: publicProfileProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { username: input.username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isMountainBiker: true,
        isPetOwner: true,
        isHiker: true,
        isClimber: true,
        isPaddleBoarder: true,
        bio: true,
        isProfilePublic: true,
      },
    })
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" })
    return user
  }),
  spots: publicProfileProcedure.input(z.object({ username: z.string() })).query(async ({ ctx, input }) => {
    return ctx.prisma.$queryRaw<
      Array<Pick<Spot, "id" | "name" | "address"> & { rating?: number; image?: SpotImage["path"] | null }>
    >`
      SELECT Spot.id, Spot.name, Spot.address, AVG(Review.rating) as rating, (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image
      FROM Spot
      LEFT JOIN Review ON Spot.id = Review.spotId
      WHERE Spot.creatorId = (SELECT id FROM User WHERE username = ${input.username})
      GROUP BY Spot.id
      ORDER BY Spot.createdAt DESC, Spot.id
      LIMIT 20`
  }),
  lists: publicProfileProcedure.query(async ({ ctx }) => {
    return ctx.prisma.list.findMany({ where: { creatorId: ctx.publicUser.id }, take: 10 })
  }),
  van: publicProfileProcedure.query(async ({ ctx }) => {
    return ctx.prisma.van.findUnique({ where: { userId: ctx.publicUser.id }, include: { images: true } })
  }),
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: input })
    return user
  }),
})
