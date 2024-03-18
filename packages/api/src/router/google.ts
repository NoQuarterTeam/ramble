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
  photos: GooglePlacePhoto[]
}

type GooglePlacesResponse = {
  places?: GooglePlace[]
}

export const googleRouter = createTRPCRouter({
  getPlacesInBounds: protectedProcedure
    .input(z.object({ ne: z.array(z.number()), sw: z.array(z.number()) }))
    .query(async ({ input }) => {
      const data = {
        textQuery: "nature camping",
        includedType: "campground",
        locationRestriction: {
          rectangle: {
            high: {
              latitude: input.ne[1],
              longitude: input.ne[0],
            },
            low: {
              latitude: input.sw[1],
              longitude: input.sw[0],
            },
          },
        },
      }
      const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": env.GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.photos",
        },
        body: JSON.stringify(data),
      })
      const json: GooglePlacesResponse = await res.json()
      return (json.places || []).map((place) => ({
        id: place.id,
        name: place.displayName.text,
        location: place.location,
        photos: place.photos.map((photo) => photo.name),
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
