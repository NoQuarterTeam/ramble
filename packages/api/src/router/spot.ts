import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { Spot, SpotImage, SpotType } from "@ramble/database/types"
import Supercluster from "supercluster"
import { TRPCError } from "@trpc/server"

export const spotRouter = createTRPCRouter({
  clusters: publicProcedure
    .input(
      z.object({
        zoom: z.number(),
        minLat: z.number(),
        maxLat: z.number(),
        minLng: z.number(),
        maxLng: z.number(),
        type: z.array(z.string()).or(z.string()).optional(),
        isPetFriendly: z.boolean().nullish(),
        isVerified: z.boolean().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { zoom, type, isVerified, isPetFriendly, ...coords } = input

      const spots = await ctx.prisma.spot.findMany({
        select: { id: true, latitude: true, longitude: true, type: true },
        where: {
          verifiedAt: isVerified ? { not: { equals: null } } : undefined,
          isPetFriendly: isPetFriendly ? { equals: true } : undefined,
          latitude: { gt: coords.minLat, lt: coords.maxLat },
          longitude: { gt: coords.minLng, lt: coords.maxLng },
          type: type
            ? typeof type === "string"
              ? { equals: type as SpotType }
              : type.length > 0
              ? { in: type as SpotType[] }
              : undefined
            : undefined,
        },
        orderBy: { createdAt: "desc" },
      })
      if (spots.length === 0) return []
      const supercluster = new Supercluster()
      const clusters = supercluster.load(
        spots.map((spot) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [spot.longitude, spot.latitude] },
          properties: { id: spot.id, type: spot.type },
        })),
      )
      return clusters.getClusters([coords.minLng, coords.minLat, coords.maxLng, coords.maxLat], zoom || 5)
    }),
  latest: publicProcedure.query(
    async ({ ctx }) =>
      ctx.prisma.$queryRaw<Array<Pick<Spot, "id" | "name" | "address"> & { rating: number; image: SpotImage["path"] }>>`
        SELECT Spot.id, Spot.name, Spot.address, AVG(Review.rating) as rating, (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image
        FROM Spot
        LEFT JOIN Review ON Spot.id = Review.spotId
        GROUP BY Spot.id
        ORDER BY Spot.createdAt DESC, Spot.id
        LIMIT 20
      `,
  ),
  mapPreview: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id },
      include: { verifier: true, _count: { select: { reviews: true } }, images: true },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    return { ...spot, rating }
  }),
  detail: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const spot = await ctx.prisma.spot.findUnique({
      where: { id: input.id },
      include: { verifier: true, _count: { select: { reviews: true } }, images: true },
    })
    if (!spot) throw new TRPCError({ code: "NOT_FOUND" })
    const rating = await ctx.prisma.review.aggregate({ where: { spotId: input.id }, _avg: { rating: true } })
    return { ...spot, rating }
  }),
})
