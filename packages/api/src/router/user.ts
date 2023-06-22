import { TRPCError } from "@trpc/server"

import { createTRPCRouter, protectedProcedure, publicProcedure, publicProfileProcedure } from "../trpc"
import { updateSchema } from "../schemas/user"

export const userRouter = createTRPCRouter({
  me: publicProcedure.query(({ ctx }) => ctx.user),
  profile: publicProfileProcedure.query(async ({ ctx, input }) => {
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
  update: protectedProcedure.input(updateSchema).mutation(async ({ ctx, input }) => {
    const user = await ctx.prisma.user.update({ where: { id: ctx.user.id }, data: input })
    return user
  }),
})
