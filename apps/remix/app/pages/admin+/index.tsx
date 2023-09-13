import { useLoaderData } from "@remix-run/react"
import { Tile, TileBody, TileHeader } from "~/components/ui"

import { db } from "~/lib/db.server"
import { json } from "~/lib/remix.server"

export const loader = async () => {
  const [spotCount, userCount, listCount] = await Promise.all([db.spot.count(), db.user.count(), db.list.count()])

  return json({ spotCount, userCount, listCount })
}

export default function AdminHome() {
  const { spotCount, userCount, listCount } = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Spots</h2>
        </TileHeader>
        <TileBody>
          <p className="text-3xl">{spotCount.toLocaleString()}</p>
        </TileBody>
      </Tile>
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Users</h2>
        </TileHeader>
        <TileBody>
          <p className="text-3xl">{userCount.toLocaleString()}</p>
        </TileBody>
      </Tile>
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Lists</h2>
        </TileHeader>
        <TileBody>
          <p className="text-3xl">{listCount.toLocaleString()}</p>
        </TileBody>
      </Tile>
    </div>
  )
}
