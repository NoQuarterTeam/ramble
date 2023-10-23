import { Spot, SpotImage } from "@ramble/database/types"
import { FlickrResponse, flickr } from "../lib/flickr.server"

export async function getSpotFlickrImages(
  spot: Pick<Spot, "type" | "latitude" | "longitude"> & { images: Pick<SpotImage, "id">[] },
) {
  if (spot.images.length > 0) return null
  if (spot.type !== "SURFING" && spot.type !== "CLIMBING") return null

  const res: FlickrResponse = await flickr("flickr.photos.search", {
    lat: spot.latitude.toString(),
    lon: spot.longitude.toString(),
    per_page: "10",
    text: spot.type === "SURFING" ? "surf" : "climbing",
  }).catch((error) => {
    console.log(error)
  })
  if (!res?.photos?.photo) return null
  if (res.photos.photo.length === 0) return null

  return res.photos.photo.map((photo) => ({
    id: photo.id,
    src: `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_c.jpg`,
    link: `https://flickr.com/photos/${photo.owner}/${photo.id}`,
  }))
}
