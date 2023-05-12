import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { createImageUrl } from "@ramble/shared"
import { db } from "~/lib/db.server"

export const loader = async () => {
  const spots = await db.spot.findMany({
    take: 10,
    select: { id: true, name: true, images: { take: 1, orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  })
  return json(spots)
}

export default function Latest() {
  const spots = useLoaderData<typeof loader>()

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
              src={
                spot.images[0]?.path
                  ? spot.images[0].path.startsWith("http")
                    ? spot.images[0].path + "?" + i
                    : createImageUrl(spot.images[0].path)
                  : undefined
              }
            />
            <Link to={`/spots/${spot.id}`}>
              <p>{spot.name}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
