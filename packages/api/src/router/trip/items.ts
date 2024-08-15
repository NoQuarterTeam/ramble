import { z } from "zod"

import { TRPCError } from "@trpc/server"
import dayjs from "dayjs"
import { createTRPCRouter, protectedProcedure } from "../../trpc"

export const tripItemsRouter = createTRPCRouter({
  update: protectedProcedure.input(z.object({ id: z.string(), date: z.date().nullish() })).mutation(async ({ ctx, input }) => {
    const oldItem = await ctx.prisma.tripItem.findUnique({ where: { id: input.id } })
    if (!oldItem) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" })

    const newItem = await ctx.prisma.tripItem.update({ where: { id: input.id }, data: { date: input.date } })

    // move item to new position if date changed
    if (input.date && oldItem.date !== input.date) {
      // only reorder if dates changed
      const tripItems = await ctx.prisma.tripItem.findMany({
        where: { tripId: oldItem.tripId },
        orderBy: { order: "asc" },
      })
      const itemsWithDates = tripItems.filter((item) => !!item.date)
      const isSorted = itemsWithDates.every(
        (item, i) =>
          i === 0 ||
          dayjs(item.date!).isSame(itemsWithDates[i - 1]!.date!) ||
          dayjs(item.date!).isAfter(itemsWithDates[i - 1]!.date!),
      )
      // dont need to do anything if already sorted
      if (isSorted) return newItem
      // find new order
      let newOrder = -1
      for (const item of tripItems) {
        if (item.id === input.id || !item.date) continue
        if (dayjs(item.date).isBefore(input.date)) {
          newOrder = item.order + 0.5
        } else {
          break
        }
      }
      // set order and sort the list again to get unique order values
      const newItems = tripItems
        .map((item) => {
          if (item.id === input.id) return { ...item, order: newOrder }
          return item
        })
        .sort((a, b) => a.order - b.order)

      await ctx.prisma.$transaction(async (tx) => {
        await Promise.all(newItems.map((item, order) => tx.tripItem.update({ where: { id: item.id }, data: { order } })))
      })
      return newItem
    }
  }),
  remove: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.tripItem.findUniqueOrThrow({ where: { id: input.id }, include: { stop: true } })
    await ctx.prisma.$transaction(async (tx) => {
      if (item.stop) {
        await tx.tripStop.delete({ where: { id: item.stop.id } })
      }
      await tx.tripItem.delete({ where: { id: input.id } })
      return
    })
    return true
  }),
})
