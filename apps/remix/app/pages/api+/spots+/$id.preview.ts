import crypto from "crypto"
import { type LoaderFunctionArgs, type SerializeFrom } from "@vercel/remix"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"

import { FULL_WEB_URL } from "@ramble/server-env"
import { getActivityFlickrImages, publicSpotWhereClause } from "@ramble/server-services"
import { spotPartnerFields } from "@ramble/shared"

import { db } from "~/lib/db.server"
import { json, notFound } from "~/lib/remix.server"
import { reviewItemSelectFields } from "~/pages/_main+/_app+/components/ReviewItem"
import { getCurrentUser } from "~/services/auth/auth.server"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request)
  const searchParams = new URLSearchParams(new URL(request.url).search)
  const language = searchParams.get("lang") || user.preferredLanguage || "en"
  const initialSpot = await db.spot.findUnique({
    where: { id: params.id, ...publicSpotWhereClause(user.id) },
    select: { id: true, latitude: true, longitude: true, description: true },
  })
  if (!initialSpot) throw notFound()
  const descriptionHash = initialSpot.description ? crypto.createHash("sha1").update(initialSpot.description).digest("hex") : ""

  const data = await promiseHash({
    sameLocationSpots: db.spot.findMany({
      where: { ...publicSpotWhereClause(user.id), latitude: initialSpot.latitude, longitude: initialSpot.longitude },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    }),
    spot: db.spot.findUniqueOrThrow({
      where: { id: initialSpot.id, ...publicSpotWhereClause(user.id) },
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
    translatedDescription: descriptionHash
      ? fetch(`${FULL_WEB_URL}/api/spots/${initialSpot.id}/translate/${language}`).then((r) => r.json())
      : (async () => null)(),
  })
  const flickrImages = await getActivityFlickrImages(data.spot)

  return json(
    {
      spot: data.spot,
      rating: data.rating._avg.rating,
      sameLocationSpots: data.sameLocationSpots,
      flickrImages,
      translatedDescription: data.translatedDescription,
      descriptionHash,
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
