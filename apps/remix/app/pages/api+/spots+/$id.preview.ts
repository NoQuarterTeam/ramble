import { type LoaderFunctionArgs, type SerializeFrom } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"

import { getSpotFlickrImages, publicSpotWhereClause } from "@ramble/server-services"
import { spotPartnerFields } from "@ramble/shared"

import { db } from "~/lib/db.server"
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
  const flickrImages = await getSpotFlickrImages(data.spot)

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
