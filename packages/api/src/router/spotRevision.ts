// import { spotRevisionSchema } from "@ramble/server-schemas"

// import { createTRPCRouter, publicProcedure } from "../trpc"

// export const spotRevisionRouter = createTRPCRouter({
//   create: publicProcedure
//     .input(
//       spotRevisionSchema,
//       // spotRevisionSchema.and(
//       // 	z.object({
//       // 		type: z.nativeEnum(SpotType),
//       // 		images: z.array(z.object({ path: z.string() })),
//       // 		amenities: spotAmenitiesSchema.partial().optional(),
//       // 		shouldPublishLater: z.boolean().optional(),
//       // 	}),
//       // ),
//     )
//     .mutation(async ({ ctx, input }) => {
//       const spotRevision = await ctx.prisma.spotRevision.create({
//         data: {
//           spotId: input.spotId,
//           notes: input.notes,
//         },
//       })
//       return spotRevision
//     }),
// })
