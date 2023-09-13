import * as React from "react"
import { Await, Link, useLoaderData, useNavigate } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { defer } from "@vercel/remix"
import { Frown, Heart, Star } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl, displayRating, merge } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { CloseButton, Spinner } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { VerifiedCard } from "~/pages/_main+/_app+/components/VerifiedCard"
import { SaveToList } from "~/pages/api+/save-to-list"

import { ReviewItem, reviewItemSelectFields } from "./components/ReviewItem"

export const loader = async ({ params }: LoaderArgs) => {
  const spot = db.spot
    .findUnique({
      where: { id: params.id, deletedAt: { equals: null } },
      select: {
        id: true,
        name: true,
        address: true,
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
      headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) },
    },
  )
}

export default function SpotPreview() {
  const user = useMaybeUser()
  const promise = useLoaderData<typeof loader>()

  return (
    <SpotContainer>
      <React.Suspense fallback={<SpotFallback />}>
        <Await resolve={promise.spot}>
          {(spot) =>
            !spot ? (
              <div className="flex items-center p-2">
                <div className="w-full space-y-6">
                  <Frown className="sq-10" />
                  <h1 className="text-2xl">Oops, error loading spot!</h1>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Link
                    target="_blank"
                    rel="noopener norefer"
                    to={`/spots/${spot.id}`}
                    className="line-clamp-2 text-xl leading-6 hover:underline"
                  >
                    {spot.name}
                  </Link>
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
                    {spot.images?.map((image) => (
                      <OptimizedImage
                        alt="spot"
                        width={350}
                        placeholder={image.blurHash}
                        height={225}
                        className="rounded-xs h-[225px] object-cover"
                        key={image.id}
                        src={createImageUrl(image.path)}
                      />
                    ))}
                  </div>
                </div>
                <VerifiedCard spot={spot} />
                <p className="line-clamp-6 whitespace-pre-wrap text-sm">{spot.description}</p>
                <p className="text-sm italic">{spot.address}</p>
                <div className="flex justify-end">
                  <LinkButton variant="link" to={`/spots/${spot.id}`}>
                    Read more
                  </LinkButton>
                </div>

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
                      <LinkButton variant="secondary" to={`/spots/${spot.id}/reviews/new`}>
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
