import * as React from "react"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import { Camera } from "lucide-react"

import { createImageUrl } from "@ramble/shared"
import { Button } from "@ramble/ui"

import { db } from "~/lib/db.server"

import { PageContainer } from "../../components/PageContainer"

export const loader = async ({ request }: LoaderArgs) => {
  const searchParams = new URL(request.url).searchParams
  const skip = parseInt((searchParams.get("skip") as string) || "0")
  const spots = await db.spot.findMany({
    take: 10,
    skip,
    where: { images: { some: {} } },
    // where: { verifiedAt: { not: { equals: null } }, images: { some: {} } },
    select: { id: true, name: true, address: true, images: { select: { path: true }, take: 1, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
  const count = await db.spot.count({ where: { images: { some: {} } } })
  return json({ spots, count })
}

export default function Latest() {
  const { spots: initialSpots, count } = useLoaderData<typeof loader>()

  const spotFetcher = useFetcher<typeof loader>()
  const [spots, setSpots] = React.useState(initialSpots)

  const onNext = () => spotFetcher.load(`/latest?skip=${spots.length}`)

  React.useEffect(() => {
    if (spotFetcher.state === "loading") return
    const data = spotFetcher.data?.spots
    if (data) setSpots((prev) => [...prev, ...data])
  }, [spotFetcher.data, spotFetcher.state])

  return (
    <PageContainer>
      <h1 className="text-3xl">Latest Spots</h1>
      <div className="space-y-2">
        {spots.map((spot) => (
          <Link to={`/spots/${spot.id}`} key={spot.id} className="flex items-center space-x-2 hover:opacity-70">
            {spot.images[0] ? (
              <img
                alt="spot"
                width={200}
                height={100}
                className="h-[100px] min-w-[200px] rounded-md bg-gray-50 object-cover dark:bg-gray-700"
                src={spot.images[0].path ? createImageUrl(spot.images[0].path) : undefined}
              />
            ) : (
              <div className="flex h-[100px] min-w-[200px] items-center justify-center rounded-md bg-gray-50 object-cover dark:bg-gray-700">
                <Camera className="opacity-50" />
              </div>
            )}

            <div>
              <p className="text-2xl">{spot.name}</p>
              <p className="text-sm font-thin opacity-70">{spot.address.split(",").join(", ")}</p>
            </div>
          </Link>
        ))}
        {count > 10 && (
          <div className="flex items-center justify-center">
            <Button size="lg" isLoading={spotFetcher.state === "loading"} variant="outline" onClick={onNext}>
              Load more
            </Button>
          </div>
        )}
      </div>
    </PageContainer>
  )
}
