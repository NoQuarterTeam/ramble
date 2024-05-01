import type { Spot, SpotImage } from "@ramble/database/types"
import { env } from "@ramble/server-env"
import * as Sentry from "@sentry/nextjs"
import { createFlickr } from "flickr-sdk"

export const { flickr } = createFlickr(env.FLICKR_ACCESS_KEY)

export type FlickrResponse =
  | { photos: { photo: { id: string; secret: string; owner: string; server: string }[] | undefined } | undefined }
  | undefined

export async function getActivityFlickrImages(
  spot: Pick<Spot, "type" | "latitude" | "longitude"> & { images: Pick<SpotImage, "id">[] },
) {
  try {
    if (spot.images.length > 0) return null
    if (spot.type !== "SURFING" && spot.type !== "CLIMBING") return null

    const res: FlickrResponse = await flickr("flickr.photos.search", {
      lat: spot.latitude.toString(),
      lon: spot.longitude.toString(),
      per_page: "10",
      text: spot.type === "SURFING" ? "surf" : "climbing",
    })
    if (!res?.photos?.photo) return null
    if (res.photos.photo.length === 0) return null

    return res.photos.photo.map((photo) => ({
      id: photo.id,
      src: `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_c.jpg`,
      link: `https://flickr.com/photos/${photo.owner}/${photo.id}`,
    }))
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}
export async function getPlaceFlickrImage(name: string) {
  try {
    const res: FlickrResponse = await flickr("flickr.photos.search", {
      per_page: "1",
      text: name,
      sort: "relevance",
    })
    if (!res?.photos?.photo) return null
    if (res.photos.photo.length === 0) return null
    const firstFind = res.photos.photo[0]
    if (!firstFind) return null
    return `https://live.staticflickr.com/${firstFind.server}/${firstFind.id}_${firstFind.secret}_c.jpg`
  } catch (error) {
    Sentry.captureException(error)
    return null
  }
}
