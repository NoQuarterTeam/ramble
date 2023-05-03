import * as React from "react"
import { Await, isRouteErrorResponse, Link, useLoaderData, useNavigate, useRouteError } from "@remix-run/react"
import type { LoaderArgs } from "@vercel/remix"
import { defer } from "@vercel/remix"
import { Frown, Star } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"

import type { Prisma } from "@travel/database"
import { merge } from "@travel/shared"
import { Avatar, CloseButton, Spinner } from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { createImageUrl } from "~/lib/s3"

export const loader = async ({ params }: LoaderArgs) => {
  const select = {
    id: true,
    name: true,
    address: true,
    description: true,
    images: { select: { id: true, path: true } },
    reviews: {
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        rating: true,
        description: true,
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    },
  } satisfies Prisma.SpotSelect

  const spot = new Promise((res) => db.spot.findUniqueOrThrow({ where: { id: params.id }, select }).then(res)) as Promise<
    Prisma.SpotGetPayload<{ select: typeof select }>
  >

  const rating = new Promise((res) =>
    db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } }).then(res),
  ) as Promise<Prisma.GetReviewAggregateType<{ _avg: { rating: true } }>>

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
  const promise = useLoaderData<typeof loader>()
  return (
    <SpotContainer>
      <React.Suspense fallback={<SpotFallback />}>
        <Await resolve={promise.spot}>
          {(spot) => (
            <div className="space-y-6">
              <div className="space-y-2">
                <Link target="_blank" rel="noopener norefer" to={`/spots/${spot.id}`} className="text-lg hover:underline">
                  {spot.name}
                </Link>
                <div className="hstack">
                  <Star className="sq-5" />
                  <React.Suspense fallback={<Spinner size="sm" />}>
                    <Await resolve={promise.rating}>
                      {(rating) => <p>{rating._avg.rating?.toFixed(1) || "Not yet rated"}</p>}
                    </Await>
                  </React.Suspense>
                </div>
                <p className="text-sm">{spot.address}</p>
                <div className="relative flex h-[225px] space-x-2 overflow-scroll">
                  {spot.images?.map((image, i) => (
                    <img
                      alt="spot"
                      width={350}
                      height={225}
                      className="rounded-md"
                      key={image.id}
                      src={`${image.path}?${spot.id}${i}`}
                    />
                  ))}
                </div>
                <p className="text-sm">{spot.description}</p>
              </div>
              <hr />
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Reviews</h2>
                <div className="space-y-6">
                  {spot.reviews?.map((review) => (
                    <div key={review.id} className="stack space-y-2 rounded border border-gray-50 px-4 py-3 dark:border-gray-700">
                      <div className="flex justify-between">
                        <div className="hstack">
                          <Avatar
                            className="sq-10 rounded-full"
                            name={`${review.user.firstName} ${review.user.lastName}`}
                            src={createImageUrl(review.user.avatar)}
                          />
                          <div>
                            <p className="text-md">
                              {review.user.firstName} {review.user.lastName}
                            </p>
                            <p className="text-sm opacity-70">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="hstack">
                          <Star className="sq-5" />
                          <p>{review.rating}</p>
                        </div>
                      </div>
                      <p className="text-sm">{review.description}</p>
                    </div>
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
      <Skeleton className="h-8 w-4/5" />
      <Skeleton className="h-6 w-10" />
      <Skeleton className="h-5 w-40" />
      <div className="flex h-[225px] w-full space-x-2 overflow-hidden">
        <Skeleton className="h-[225px] min-w-[350px] rounded" />
        <Skeleton className="h-[225px] min-w-[350px] rounded" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
export function Skeleton(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={merge("animate-pulse rounded bg-gray-100 dark:bg-gray-700", props.className)} />
}

function SpotContainer(props: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="border-gray-75 absolute bottom-0 left-0 top-0 z-10 w-full max-w-[400px] overflow-scroll border-r bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <CloseButton
        className="absolute right-2 top-2 z-10"
        onClick={() => {
          const params = queryString.stringify(queryString.parse(window.location.search))
          navigate(`..?${params}`)
        }}
      />
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
