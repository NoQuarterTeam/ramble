import { ArrowLeft, ArrowRight, Heart, Star } from "lucide-react"

import { publicSpotWhereClause } from "@ramble/server-services"
import { createAssetUrl, displayRating, isPartnerSpot, promiseHash, spotPartnerFields } from "@ramble/shared"

import { AppCta } from "@/components/AppCta"
import { LinkButton } from "@/components/LinkButton"
import { PartnerLink } from "@/components/PartnerLink"
import { SpotTypeBadge } from "@/components/SpotTypeBadge"
import { VerifiedCard } from "@/components/VerifiedCard"
import { db } from "@/lib/server/db"
import { unstable_cache } from "next/cache"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ReviewItem, reviewItemSelectFields } from "./ReviewItem"
import { SpotContainer } from "./SpotContainer"

const getSpotData = (id: string) =>
  unstable_cache(
    async () => {
      const initialSpot = await db.spot.findUnique({
        where: { id, ...publicSpotWhereClause(null) },
        select: { id: true, latitude: true, longitude: true, description: true },
      })
      if (!initialSpot) throw notFound()

      const data = await promiseHash({
        sameLocationSpots: db.spot.findMany({
          where: { ...publicSpotWhereClause(null), latitude: initialSpot.latitude, longitude: initialSpot.longitude },
          select: { id: true },
          orderBy: { createdAt: "desc" },
        }),
        spot: db.spot.findUniqueOrThrow({
          where: { id: initialSpot.id, ...publicSpotWhereClause(null) },
          select: {
            id: true,
            name: true,
            type: true,
            ...spotPartnerFields,
            _count: { select: { reviews: true, listSpots: true } },
            description: true,
            reviews: { take: 5, select: reviewItemSelectFields },
            verifier: { select: { firstName: true, username: true, lastName: true, avatar: true, avatarBlurHash: true } },
            verifiedAt: true,
            images: { select: { id: true, path: true, blurHash: true } },
          },
        }),
        rating: db.review.aggregate({ where: { spotId: initialSpot.id }, _avg: { rating: true } }),
      })
      return {
        spot: data.spot,
        rating: data.rating._avg.rating,
        sameLocationSpots: data.sameLocationSpots,
      }
    },
    ["spot-preview", id],
    { revalidate: 120 },
  )()

export default async function Page({ params }: { params: { id: string } }) {
  const data = await getSpotData(params.id)

  const spot = data?.spot
  const sameLocationSpots = data?.sameLocationSpots
  const rating = data?.rating

  return (
    <SpotContainer>
      <div className="space-y-4">
        <div className="space-y-2">
          <SpotTypeBadge spot={spot} />
          <div className="flex items-center space-x-2">
            <h2 className="line-clamp-2 text-xl leading-6">{spot.name}</h2>
          </div>
          {sameLocationSpots && <SameSpotNavigation spots={sameLocationSpots} id={params.id} />}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="sq-4 fill-black dark:fill-white" />
                <p>{displayRating(rating)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="sq-4 fill-black dark:fill-white" />
                <p>{spot._count.listSpots || 0}</p>
              </div>
            </div>
          </div>
        </div>
        {spot.images.length > 0 && (
          <div className="w-full overflow-x-scroll rounded-xs">
            <div className="relative flex h-[225px] w-max space-x-2">
              {spot.images.map((image) => (
                <Image
                  alt="spot"
                  width={350}
                  height={225}
                  unoptimized={image.path.startsWith("http")}
                  className="h-[225px] max-w-[350px] rounded-xs object-cover"
                  key={image.id}
                  src={createAssetUrl(image.path)}
                />
              ))}
            </div>
          </div>
        )}
        {isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}
        <div>
          <h3 className="font-medium text-lg">Description</h3>
          <p className="whitespace-pre-wrap line-clamp-2">{spot.description}</p>
        </div>
        <AppCta message="Download the app to read more" />
        <hr />
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-xl">
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </p>
              <p>·</p>
              <div className="flex items-center space-x-1">
                <Star className="sq-5 fill-black dark:fill-white" />
                <p>{displayRating(rating)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {spot.reviews?.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </SpotContainer>
  )
}

function SameSpotNavigation({ id, spots }: { id: string; spots: Awaited<ReturnType<typeof getSpotData>>["sameLocationSpots"] }) {
  if (spots.length === 1) return null
  const currentIndex = spots.findIndex((s) => s.id === id)
  const isLast = currentIndex === spots.length - 1
  const isFirst = currentIndex === 0
  return (
    <div className="flex items-center space-x-2">
      <LinkButton
        leftIcon={<ArrowLeft size={14} />}
        size="sm"
        variant="outline"
        href={`/map/${isFirst ? spots[spots.length - 1]?.id : spots[currentIndex - 1]?.id}`}
      >
        Prev
      </LinkButton>
      <p className="text-sm">
        {currentIndex + 1} / {spots.length}
      </p>
      <LinkButton
        rightIcon={<ArrowRight size={14} />}
        size="sm"
        variant="outline"
        href={`/map/${isLast ? spots[0]?.id : spots[currentIndex + 1]?.id}`}
      >
        Next
      </LinkButton>
    </div>
  )
}
