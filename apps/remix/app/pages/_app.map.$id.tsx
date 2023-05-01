import { Await, isRouteErrorResponse, useLoaderData, useNavigate, useRouteError } from "@remix-run/react"
import { defer, type LoaderArgs } from "@vercel/remix"
import { Frown, Star } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import queryString from "query-string"
import * as React from "react"

import { Avatar, CloseButton } from "@travel/ui"

import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers"
import { notFound } from "~/lib/remix"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      address: true,
      images: { select: { id: true, path: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          rating: true,
          description: true,
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
      },
    },
  })
  if (!spot) throw notFound("Spot not found")
  const averageRating = await db.review.aggregate({
    where: { spotId: params.id },
    _avg: { rating: true },
  })

  return defer(
    { ...spot, rating: averageRating._avg.rating?.toFixed(1) },
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

export default function SpotTile() {
  const spotPromise = useLoaderData<typeof loader>()

  return (
    <SpotContainer>
      <React.Suspense>
        <Await resolve={spotPromise}>
          {(spot) => (
            <div className="space-y-2">
              <p className="text-lg">{spot.name}</p>
              <div className="hstack">
                <Star className="sq-5" />
                <p>{spot.rating || "Not yet rated"}</p>
              </div>
              <p>{spot.address}</p>
              <div className="relative flex space-x-2 overflow-scroll">
                {spot.images?.map((image, i) => (
                  <img alt="spot" className="rounded-md" key={image.id} src={`${image.path}?${spot.id}${i}`} />
                ))}
              </div>
              <div>
                <h2 className="text-lg">Reviews</h2>
                <div className="space-y-6">
                  {spot.reviews?.map((review) => (
                    <div key={review.id} className="stack space-y-2">
                      <div className="flex justify-between">
                        <div className="hstack">
                          <Avatar
                            className="sq-10 rounded-full"
                            name={`${review.user.firstName} ${review.user.lastName}`}
                            src={review.user.avatar}
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

function SpotContainer(props: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <div className="mt-nav absolute bottom-4 left-4 top-4 z-10 w-[400px] overflow-scroll rounded-md bg-white p-4 shadow-md dark:bg-gray-800">
      <CloseButton
        className="absolute right-2 top-2"
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
      <div className="flex  items-center p-2">
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
