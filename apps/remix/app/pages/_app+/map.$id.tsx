import * as React from "react"
// TODO: change to vercel
import { defer } from "@remix-run/node"
import { Await, isRouteErrorResponse, Link, useLoaderData, useNavigate, useRouteError } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { BadgeX, Frown, Star, Verified } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl, merge } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage } from "~/components/OptimisedImage"
import { CloseButton, Spinner } from "~/components/ui"
import { db } from "~/lib/db.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

import { ReviewItem, reviewItemSelectFields } from "./components/ReviewItem"

export const loader = async ({ params }: LoaderArgs) => {
  const spot = db.spot
    .findUniqueOrThrow({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        address: true,
        _count: { select: { reviews: true } },
        description: true,
        verifier: { select: { firstName: true, username: true, lastName: true, avatar: true } },
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
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "1hour",
          sMaxage: "1hour",
          staleWhileRevalidate: "1day",
          staleIfError: "1day",
        }),
      },
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
          {(spot) => (
            <div className="space-y-4">
              <div className="space-y-1">
                {spot.verifiedAt && spot.verifier ? (
                  <div className="flex items-center space-x-1 text-sm">
                    <Verified className="sq-5" />
                    <p>Verified by</p>
                    <Link to={`/${spot.verifier.username}`} className="flex hover:underline">
                      {`${spot.verifier.firstName} ${spot.verifier.lastName}`}
                      {/* <Avatar
                  size="xs"
                  src={createImageUrl(spot.verifier.avatar)}
                /> */}
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-sm">
                    <BadgeX className="sq-5" />
                    <p>Unverified</p>
                  </div>
                )}
                <Link
                  target="_blank"
                  rel="noopener norefer"
                  to={`/spots/${spot.id}`}
                  className="line-clamp-2 text-lg leading-6 hover:underline"
                >
                  {spot.name}
                </Link>
                <div className="flex flex-wrap items-center space-x-1 text-sm">
                  <Star className="sq-5" />
                  <React.Suspense fallback={<Spinner size="sm" />}>
                    <Await resolve={promise.rating}>{(rating) => <p>{rating._avg.rating?.toFixed(1) || "Not rated"}</p>}</Await>
                  </React.Suspense>
                  <p>·</p>
                  <p>
                    {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <div className="overflow-x-scroll w-full rounded-md">
                <div className="relative flex h-[225px] space-x-2 w-max">
                  {spot.images?.map((image) => (
                    <OptimizedImage
                      alt="spot"
                      width={350}
                      placeholder={image.blurHash}
                      height={225}
                      className="min-h-[225px] rounded-md object-cover"
                      key={image.id}
                      src={createImageUrl(image.path)}
                    />
                  ))}
                </div>
              </div>
              <div className="line-clamp-6 text-sm" dangerouslySetInnerHTML={{ __html: spot.description || "" }} />
              <p className="text-sm">{spot.address}</p>
              <div className="flex justify-end">
                <LinkButton variant="link" to={`/spots/${spot.id}`}>
                  Read more
                </LinkButton>
              </div>

              <hr />
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  {user && (
                    <LinkButton variant="secondary" to={`/spots/${spot.id}/reviews/new`}>
                      Add review
                    </LinkButton>
                  )}
                </div>
                <div className="space-y-6">{spot.reviews?.map((review) => <ReviewItem key={review.id} review={review} />)}</div>
              </div>
            </div>
          )}
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
      <div className="flex h-[225px] w-full space-x-2 overflow-hidden rounded-md">
        <Skeleton className="h-[225px] min-w-[350px] rounded-md" />
        <Skeleton className="h-[225px] min-w-[75px] rounded-md" />
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
  return <div {...props} className={merge("animate-pulse rounded-md bg-gray-100 dark:bg-gray-700", props.className)} />
}

function SpotContainer(props: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="absolute bottom-0 left-0 top-0 z-10 w-full max-w-lg overflow-scroll border-r border-gray-100 bg-white p-4 pb-20 dark:border-gray-700 dark:bg-gray-800 md:px-8">
      <CloseButton className="absolute right-2 top-2 z-10" onClick={() => navigate(`..${window.location.search}`)} />
      {props.children}
    </div>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  const isCatchError = isRouteErrorResponse(error)

  return (
    <SpotContainer>
      <div className="flex items-center p-2">
        {isCatchError ? (
          <div className="stack space-y-4">
            <div className="stack">
              <h1 className="text-6xl">{error.status}</h1>
              <p className="text-lg">
                {error.status === 404
                  ? "The spot you're looking for doesn't exist"
                  : error.data.message || "Something's gone wrong here"}
              </p>
            </div>
            {error.status === 404 && <LinkButton to="/map">Take me back</LinkButton>}
          </div>
        ) : error instanceof Error ? (
          <div className="stack w-full space-y-6">
            <Frown className="sq-10" />
            <h1 className="text-2xl">Oops, there was an error.</h1>
            <p>{error.message}</p>
            {error.stack && (
              <>
                <hr />
                <div className="rounded-md bg-gray-200 p-4 dark:bg-gray-700 ">
                  <pre className="overflow-scroll text-sm">{error.stack}</pre>
                </div>
              </>
            )}
          </div>
        ) : (
          <div>
            <h1 className="text-6xl">Sorry, an unknown error has occured</h1>
          </div>
        )}
      </div>
    </SpotContainer>
  )
}
