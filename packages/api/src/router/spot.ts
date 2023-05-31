import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { SpotType } from "@ramble/database/types"
import Supercluster from "supercluster"

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
        isVanFriendly: z.boolean().nullish(),
        isVerified: z.boolean().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { zoom, type, isVerified, isPetFriendly, isVanFriendly, ...coords } = input

      const spots = await ctx.prisma.spot.findMany({
        select: { id: true, latitude: true, longitude: true, type: true },
        where: {
          verifiedAt: isVerified ? { not: { equals: null } } : undefined,
          isPetFriendly: isPetFriendly ? { equals: true } : undefined,
          isVanFriendly: isVanFriendly ? { equals: true } : undefined,
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
  latest: publicProcedure.query(async ({ ctx }) =>
    ctx.prisma.spot.findMany({
      take: 20,
      select: { id: true, name: true, address: true, type: true, images: { select: { id: true, path: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ),
  byId: publicProcedure.input(z.object({ id: z.string() })).query(({ ctx, input }) =>
    ctx.prisma.spot.findUnique({
      where: { id: input.id },
      include: { verifier: true, _count: { select: { reviews: true } }, images: true },
    }),
  ),
})
