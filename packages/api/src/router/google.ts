import { z } from "zod"

import { env } from "@ramble/server-env"
import { createTRPCRouter, protectedProcedure } from "../trpc"

type GooglePlacePhoto = {
  name: string
}

type GooglePlace = {
  id: string
  displayName: { text: string; languageCode: string }
  location: { latitude: number; longitude: number }
  allowsDogs?: boolean
  restroom?: boolean
  photos?: GooglePlacePhoto[]
}

type GooglePlacesResponse = {
  places?: GooglePlace[]
}

export const googleRouter = createTRPCRouter({
  getPlacesInArea: protectedProcedure
    // .input(z.object({ ne: z.array(z.number()), sw: z.array(z.number()) }))
    .input(z.object({ center: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const data = {
        textQuery: "nature camping",
        includedType: "campground",
        locationBias: {
          circle: {
            center: {
              latitude: input.center[1],
              longitude: input.center[0],
            },
            radius: 50000,
          },
        },
        // locationRestriction: {
        //   rectangle: {
        //     high: {
        //       latitude: input.ne[1],
        //       longitude: input.ne[0],
        //     },
        //     low: {
        //       latitude: input.sw[1],
        //       longitude: input.sw[0],
        //     },
        //   },
        // },
      }
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": env.GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.photos,places.allowsDogs,places.restroom",
        },
        body: JSON.stringify(data),
      })
      const json: GooglePlacesResponse = await res.json()
      if (!json.places || json.places.length === 0) return []
      const existingGoogleSpots = await ctx.prisma.spot.findMany({ where: { googlePlaceId: { not: { equals: null } } } })
      const existingGooglePlaceIds = existingGoogleSpots.map((spot) => spot.googlePlaceId)
      const places = json.places.filter((place) => !existingGooglePlaceIds.includes(place.id))
      return places.map((place) => ({
        id: place.id,
        name: place.displayName.text,
        location: place.location,
        isPetFriendly: place.allowsDogs || false,
        toilet: place.restroom || false,
        photos: place.photos?.map((photo) => photo.name) || [],
      }))
    }),
  getPlacePhotos: protectedProcedure.input(z.object({ names: z.array(z.string()) })).query(async ({ input }) => {
    const photoUrls: string[] = []
    await Promise.all(
      input.names.map(async (name) => {
        const res = await fetch(
          `https://places.googleapis.com/v1/${name}/media?maxHeightPx=400&maxWidthPx=600&key=${env.GOOGLE_API_KEY}`,
        )
        photoUrls.push(res.url)
      }),
    )
    return photoUrls
  }),
})
