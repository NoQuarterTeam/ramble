import { publicSpotWhereClause } from "@ramble/api"
import { spotPartnerFields } from "@ramble/shared"
import { LoaderFunctionArgs, SerializeFrom } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"
import { db } from "~/lib/db.server"
import { FlickrResponse, flickr } from "~/lib/flickr.server"
import { json, notFound } from "~/lib/remix.server"
import { reviewItemSelectFields } from "~/pages/_main+/_app+/components/ReviewItem"
import { getUserSession } from "~/services/session/session.server"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { userId } = await getUserSession(request)

  const initialSpot = await db.spot.findUnique({
    where: { id: params.id, ...publicSpotWhereClause(userId) },
    select: { id: true, latitude: true, longitude: true },
  })
  if (!initialSpot) throw notFound()

  const data = await promiseHash({
    sameLocationSpots: db.spot.findMany({
      where: { ...publicSpotWhereClause(userId), latitude: initialSpot.latitude, longitude: initialSpot.longitude },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
    spot: db.spot.findUniqueOrThrow({
      where: { id: initialSpot.id, ...publicSpotWhereClause(userId) },
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
        latitude: true,
        longitude: true,
        ...spotPartnerFields,
        _count: { select: { reviews: true, listSpots: true } },
        description: true,
        verifier: { select: { firstName: true, username: true, lastName: true, avatar: true, avatarBlurHash: true } },
        verifiedAt: true,
        images: { select: { id: true, path: true, blurHash: true } },
        reviews: {
          take: 5,
          orderBy: { createdAt: "desc" },
          select: reviewItemSelectFields,
        },
      },
    }),
    rating: db.review.aggregate({ where: { spotId: initialSpot.id }, _avg: { rating: true } }),
  })
  let flickrImages: Array<{ src: string; link: string; id: string }> | undefined = undefined

  if (data.spot.images.length === 0 && (data.spot.type === "SURFING" || data.spot.type === "CLIMBING")) {
    const res: FlickrResponse = await flickr("flickr.photos.search", {
      lat: data.spot.latitude.toString(),
      lon: data.spot.longitude.toString(),
      per_page: "10",
      text: data.spot.type === "SURFING" ? "surf" : "climbing",
    }).catch((error) => {
      console.log(error)
    })
    if (res?.photos?.photo && res?.photos?.photo.length > 0) {
      console.log(res.photos.photo)

      flickrImages = res.photos.photo.map((photo) => ({
        id: photo.id,
        src: `https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_c.jpg`,
        link: `https://flickr.com/photos/${photo.owner}/${photo.id}`,
      }))
    }
  }

  return json(
    {
      spot: data.spot,
      rating: data.rating._avg.rating,
      sameLocationSpots: data.sameLocationSpots,
      flickrImages,
    },
    request,
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
      },
    },
  )
}

export type SpotPreviewData = SerializeFrom<typeof loader>
