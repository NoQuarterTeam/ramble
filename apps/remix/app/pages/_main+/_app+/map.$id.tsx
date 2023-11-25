import type * as React from "react"
import { Link, useNavigate, useParams } from "@remix-run/react"
import { ArrowLeft, ArrowRight, Frown, Heart, Image, Star } from "lucide-react"
import { useAuthenticityToken } from "remix-utils/csrf/react"
import { z } from "zod"

import { type SpotType } from "@ramble/database/types"
import { generateBlurHash } from "@ramble/server-services"
import { createImageUrl, displayRating, isPartnerSpot, join, merge } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { ImageUploader } from "~/components/ImageUploader"
import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
import { Button, CloseButton } from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form.server"
import { useFetcherQuery } from "~/lib/hooks/useFetcherQuery"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json, notFound } from "~/lib/remix.server"
import type { ActionFunctionArgs } from "~/lib/vendor/vercel.server"
import { VerifiedCard } from "~/pages/_main+/_app+/components/VerifiedCard"
import { SaveToList } from "~/pages/api+/save-to-list"
import { type SpotPreviewData } from "~/pages/api+/spots+/$id.preview"
import { getCurrentUser } from "~/services/auth/auth.server"

import { PartnerLink } from "./components/PartnerLink"
import { ReviewItem } from "./components/ReviewItem"
import { NEW_REVIEW_REDIRECTS } from "./spots.$id_.reviews.new"

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  const schema = z.object({ images: z.string() })
  const result = await validateFormData(request, schema)
  if (!result.success) return formError(result)
  const images = result.data.images.split(",")
  const spot = await db.spot.findUnique({ where: { id: params.id } })
  if (!spot) throw notFound()
  const imageData = await Promise.all(
    images.map(async (image) => {
      const blurHash = await generateBlurHash(image)
      return { path: image, blurHash, creator: { connect: { id: user.id } } }
    }),
  )
  await db.spot.update({ where: { id: spot.id }, data: { images: { create: imageData } } })
  track("Images added to spot preview", { spotId: spot.id, userId: user.id })
  return json({ success: true })
}

export default function SpotPreview() {
  const user = useMaybeUser()
  const params = useParams()

  const { data, state } = useFetcherQuery<SpotPreviewData>(`/api/spots/${params.id}/preview`)
  const spot = data?.spot
  const sameLocationSpots = data?.sameLocationSpots
  const rating = data?.rating

  const imageFetcher = useFetcher()

  const csrf = useAuthenticityToken()

  if ((state === "idle" && !data) || (state === "loading" && !data))
    return (
      <SpotContainer>
        <SpotFallback />
      </SpotContainer>
    )
  if (!spot)
    return (
      <SpotContainer>
        <p>Spot not found</p>
      </SpotContainer>
    )

  return (
    <SpotContainer>
      <div className="space-y-4">
        <div className="space-y-1">
          <SpotTypeBadge spot={spot} />
          <div className={join("flex items-center space-x-2", state === "loading" && "animate-pulse-fast")}>
            {!(["SURFING", "HIKING", "MOUNTAIN_BIKING"] as SpotType[]).includes(spot.type) ? (
              <Link
                target="_blank"
                rel="noopener norefer"
                to={`/spots/${spot.id}`}
                className="line-clamp-2 text-xl leading-6 hover:underline"
              >
                {spot.name}
              </Link>
            ) : (
              <p className="line-clamp-2 text-xl leading-6">{spot.name}</p>
            )}
          </div>
          {sameLocationSpots && <SameSpotNavigation spots={sameLocationSpots} />}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="sq-4" />
                <p>{displayRating(rating)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="sq-4" />
                <p>{spot._count.listSpots || 0}</p>
              </div>
            </div>
            {user && <SaveToList spotId={spot.id} />}
          </div>
        </div>
        <div key={spot.id} className="rounded-xs w-full overflow-x-scroll">
          <div className="relative flex h-[225px] w-max space-x-2">
            {data.flickrImages
              ? data.flickrImages.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="relative hover:opacity-80"
                  >
                    <img src={photo.src} width={350} height={225} className="rounded-xs h-[225px] max-w-[350px] object-cover" />
                    <img src="/flickr.svg" className="absolute bottom-1 left-1 object-contain" width={100} />
                  </a>
                ))
              : spot.images.map((image) => (
                  <OptimizedImage
                    alt="spot"
                    width={350}
                    placeholder={image.blurHash}
                    height={225}
                    className="rounded-xs h-[225px] max-w-[350px] object-cover"
                    key={image.id}
                    src={createImageUrl(image.path)}
                  />
                ))}
            <div className="center rounded-xs h-full w-[350px] flex-col gap-2 border bg-gray-50 dark:bg-gray-800">
              <Image size={40} strokeWidth={1} />
              {user && (
                <>
                  {spot.images.length === 0 && <p className="text-sm">Be the first to add an image</p>}
                  <ImageUploader
                    isMulti
                    onMultiSubmit={(images) =>
                      imageFetcher.submit({ images, csrf }, { method: "POST", action: `/map/${spot.id}` })
                    }
                  >
                    <Button variant="outline">Upload</Button>
                  </ImageUploader>
                </>
              )}
            </div>
          </div>
        </div>
        {isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}

        <p className="line-clamp-6 whitespace-pre-wrap">{spot.description}</p>
        <p className="text-sm italic">{spot.address}</p>
        {!(["SURFING", "HIKING", "MOUNTAIN_BIKING"] as SpotType[]).includes(spot.type) && (
          <div className="flex justify-end">
            <LinkButton variant="link" to={`/spots/${spot.id}`}>
              Read more
            </LinkButton>
          </div>
        )}

        <hr />
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-xl">
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </p>
              <p>·</p>
              <div className="flex items-center space-x-1">
                <Star className="sq-5" />
                <p>{displayRating(rating)}</p>
              </div>
            </div>
            {user && (
              <LinkButton variant="secondary" to={`/spots/${spot.id}/reviews/new?redirect=${NEW_REVIEW_REDIRECTS.Map}`}>
                Add review
              </LinkButton>
            )}
          </div>
          <div className="space-y-6">{spot.reviews?.map((review) => <ReviewItem key={review.id} review={review} />)}</div>
        </div>
      </div>
    </SpotContainer>
  )
}

function SpotFallback() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Skeleton className="h-12 w-3/12 rounded-full" />
        <Skeleton className="h-12 w-11/12" />
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <div className="rounded-xs flex h-[225px] w-full space-x-2 overflow-hidden">
        <Skeleton className="h-[225px] min-w-[350px]" />
        <Skeleton className="h-[225px] min-w-[100px]" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="flex justify-end">
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="py-4">
        <hr />
      </div>

      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
export function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={merge("rounded-xs animate-pulse bg-gray-100 dark:bg-gray-700", props.className)} />
}

function SpotContainer(props: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="bg-background absolute bottom-0 left-0 top-0 z-10 w-full max-w-lg overflow-scroll border-r p-4 pb-20 md:px-8">
      <CloseButton className="absolute right-2 top-2 z-10" onClick={() => navigate(`..${window.location.search}`)} />
      {props.children}
    </div>
  )
}

function SameSpotNavigation({ spots }: { spots: SpotPreviewData["sameLocationSpots"] }) {
  const params = useParams()
  if (spots.length === 1) return null
  const currentIndex = spots.findIndex((s) => s.id === params.id)
  const isLast = currentIndex === spots.length - 1
  const isFirst = currentIndex === 0
  return (
    <div className="flex items-center space-x-2">
      <LinkButton
        leftIcon={<ArrowLeft size={14} />}
        size="sm"
        variant="outline"
        to={`/map/${isFirst ? spots[spots.length - 1]?.id : spots[currentIndex - 1]?.id}${window.location.search}`}
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
        to={`/map/${isLast ? spots[0]?.id : spots[currentIndex + 1]?.id}${window.location.search}`}
      >
        Next
      </LinkButton>
    </div>
  )
}

export function ErrorBoundary() {
  return (
    <SpotContainer>
      <div className="flex items-center p-2">
        <div className="w-full space-y-6">
          <Frown className="sq-10" />
          <h1 className="text-2xl">Oops, error loading spot!</h1>
        </div>
      </div>
    </SpotContainer>
  )
}
