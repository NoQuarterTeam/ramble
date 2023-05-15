import * as React from "react"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"

import { createImageUrl } from "@ramble/shared"
import { Button } from "@ramble/ui"

import { db } from "~/lib/db.server"

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = searchParams.get("skip") || 0
  const spots = await db.spot.findMany({
    take: 2,
    skip: parseInt(skip as string),
    select: { id: true, name: true, images: { take: 1, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
  return json(spots)
}

export default function Latest() {
  const initialSpots = useLoaderData<typeof loader>()

  const spotFetcher = useFetcher<typeof loader>()
  const [spots, setSpots] = React.useState(initialSpots)

  const onNext = () => spotFetcher.load(`/latest?skip=${spots.length}`)

  React.useEffect(() => {
    if (spotFetcher.state === "loading") return
    const data = spotFetcher.data
    if (data) setSpots((prev) => [...prev, ...data])
  }, [spotFetcher.data, spotFetcher.state])

  return (
    <div className="space-y-4 p-4 md:p-8">
      <h1 className="text-3xl">Latest Spots</h1>
      <div className="space-y-2">
        {spots.map((spot, i) => (
          <div key={spot.id} className="flex items-center space-x-2">
            <img
              alt="spot"
              width={200}
              height={100}
              className="h-[100px] rounded object-cover"
              src={spot.images[0]?.path ? createImageUrl(spot.images[0].path) : undefined}
            />
            <Link to={`/spots/${spot.id}`}>
              <p>{spot.name}</p>
            </Link>
          </div>
        ))}
        <div className="flex items-center justify-center">
          <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
            Load more
          </Button>
        </div>
      </div>
    </div>
  )
}
