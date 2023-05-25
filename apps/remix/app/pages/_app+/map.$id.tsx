import * as React from "react"
import { Await, isRouteErrorResponse, Link, useLoaderData, useNavigate, useRouteError } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { defer } from "@vercel/remix"
import { Frown, Star, Verified } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import { createImageUrl, merge } from "@ramble/shared"
import { CloseButton, Spinner } from "@ramble/ui"

import { LinkButton } from "~/components/LinkButton"
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
        description: true,
        verifiedAt: true,
        images: { select: { id: true, path: true } },
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
            <div className="space-y-6">
              <div className="space-y-2">
                <Link
                  target="_blank"
                  rel="noopener norefer"
                  to={`/spots/${spot.id}`}
                  className="flex items-center text-lg hover:underline"
                >
                  <span className="line-clamp-1">{spot.name}</span>
                  {spot.verifiedAt && <Verified className="sq-4 ml-1" />}
                </Link>
                <div className="hstack">
                  <Star className="sq-5" />
                  <React.Suspense fallback={<Spinner size="sm" />}>
                    <Await resolve={promise.rating}>
                      {(rating) => <p>{rating._avg.rating?.toFixed(1) || "Not yet rated"}</p>}
                    </Await>
                  </React.Suspense>
                </div>
                <p className="text-sm">{spot.address.split(",").join(", ")}</p>
                <div className="relative flex h-[225px] space-x-2 overflow-scroll rounded-md">
                  {spot.images?.map((image) => (
                    <img
                      alt="spot"
                      width={350}
                      height={225}
                      className="min-h-[225px] rounded-md object-cover"
                      key={image.id}
                      src={createImageUrl(image.path)}
                    />
                  ))}
                </div>
                <p className="line-clamp-6 text-sm" dangerouslySetInnerHTML={{ __html: spot.description }} />
                <div className="flex justify-end">
                  <LinkButton variant="link" to={`/spots/${spot.id}`}>
                    Read more
                  </LinkButton>
                </div>
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
                <div className="space-y-6">
                  {spot.reviews?.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
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
      <Skeleton className="h-7 w-11/12" />
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
    <div className="absolute bottom-0 left-0 top-0 z-10 w-full max-w-[500px] overflow-scroll border-r border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 md:px-8">
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
