import * as React from "react"
import { type SerializeFrom } from "@remix-run/node"
import { Await, Link, useLoaderData, useNavigate } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@vercel/remix"
import { defer } from "@vercel/remix"
import { Frown, Heart, Image, Star } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { z } from "zod"

import { generateBlurHash, publicSpotWhereClause } from "@ramble/api"
import { type SpotType } from "@ramble/database/types"
import { createImageUrl, displayRating, isPartnerSpot, merge, spotPartnerFields } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { ImageUploader } from "~/components/ImageUploader"
import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { PartnerLink } from "./components/PartnerLink"
import { SpotIcon } from "~/components/SpotIcon"
import { Button, CloseButton, Spinner } from "~/components/ui"
import { db } from "~/lib/db.server"
import { formError, validateFormData } from "~/lib/form"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { json, notFound } from "~/lib/remix.server"
import { VerifiedCard } from "~/pages/_main+/_app+/components/VerifiedCard"
import { SaveToList } from "~/pages/api+/save-to-list"
import { getCurrentUser } from "~/services/auth/auth.server"
import { getUserSession } from "~/services/session/session.server"

import { ReviewItem, reviewItemSelectFields } from "./components/ReviewItem"
import { NEW_REVIEW_REDIRECTS } from "./spots.$id_.reviews.new"
import { useAuthenticityToken } from "remix-utils/csrf/react"
import { track } from "@vercel/analytics/server"

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { userId } = await getUserSession(request)

  const spot = db.spot
    .findUnique({
      where: { id: params.id, ...publicSpotWhereClause(userId) },
      select: {
        id: true,
        name: true,
        address: true,
        type: true,
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
    })
    .then((s) => s)

  const rating = db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } }).then((r) => r)

  return defer(
    { spot, rating },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
      },
    },
  )
}

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

type Res = SerializeFrom<typeof loader>

export default function SpotPreview() {
  const user = useMaybeUser()
  // @ts-expect-error vercel remix issues
  const promise: Res = useLoaderData()

  const imageFetcher = useFetcher()

  const csrf = useAuthenticityToken()

  return (
    <SpotContainer>
      <React.Suspense fallback={<SpotFallback />}>
        <Await resolve={promise.spot}>
          {(spot) =>
            !spot ? (
              <div className="flex items-center p-2">
                <div className="w-full space-y-6">
                  <Frown className="sq-10" />
                  <h1 className="text-2xl">Oops, spot not found!</h1>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="sq-8 flex flex-shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-600">
                      <SpotIcon type={spot.type} className="sq-4" />
                    </div>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="sq-4" />
                        <React.Suspense fallback={<Spinner size="sm" />}>
                          <Await resolve={promise.rating}>{(rating) => <p>{displayRating(rating._avg.rating)}</p>}</Await>
                        </React.Suspense>
                      </div>
                      <div className="flex items-center space-x-1 text-sm">
                        <Heart className="sq-4" />
                        <p>{spot._count.listSpots || 0}</p>
                      </div>
                    </div>

                    {user && <SaveToList spotId={spot.id} />}
                  </div>
                </div>
                <div className="rounded-xs w-full overflow-x-scroll">
                  <div className="relative flex h-[225px] w-max space-x-2">
                    {spot.images.map((image) => (
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
                            onMultiSubmit={(keys) =>
                              imageFetcher.submit({ images: keys, csrf }, { method: "POST", action: `/map/${spot.id}` })
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

                <p className="line-clamp-6 whitespace-pre-wrap text-sm">{spot.description}</p>
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
                        <React.Suspense fallback={<Spinner size="sm" />}>
                          <Await resolve={promise.rating}>{(rating) => <p>{displayRating(rating._avg.rating)}</p>}</Await>
                        </React.Suspense>
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
            )
          }
        </Await>
      </React.Suspense>
    </SpotContainer>
  )
}

function SpotFallback() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-12 w-11/12" />
      <Skeleton className="h-6 w-10" />
      <Skeleton className="h-5 w-40" />
      <div className="rounded-xs flex h-[225px] w-full space-x-2 overflow-hidden">
        <Skeleton className="rounded-xs h-[225px] min-w-[350px]" />
        <Skeleton className="rounded-xs h-[225px] min-w-[75px]" />
      </div>
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
