import { type LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"

import { Tile, TileBody, TileHeader } from "~/components/ui"
import { db } from "~/lib/db.server"
import { json } from "~/lib/remix.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data = await promiseHash({
    spotCount: db.spot.count({ where: { deletedAt: null } }),
    verifiedSpotCount: db.spot.count({ where: { deletedAt: null, verifiedAt: { not: null } } }),
    unverifiedSpotsCount: db.spot.count({ where: { deletedAt: null, verifiedAt: null } }),
    userCount: db.user.count(),
    guideCount: db.user.count({ where: { role: "GUIDE" } }),
    memberCount: db.user.count({ where: { role: "MEMBER" } }),
    listCount: db.list.count(),
    privateListCount: db.list.count({ where: { isPrivate: true } }),
    publicListCount: db.list.count({ where: { isPrivate: false } }),
  })

  return json(data, request, {
    headers: {
      "Cache-Control": cacheHeader({ public: true, maxAge: "1h", sMaxage: "1h" }),
    },
  })
}

export default function AdminHome() {
  const data = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Spots</h2>
        </TileHeader>
        <TileBody>
          <div className="space-y-4">
            <p className="text-3xl">{data.spotCount.toLocaleString()}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">Verified</p>
                <p>{data.verifiedSpotCount}</p>
              </div>
              <div>
                <p className="text-sm">Unverified</p>
                <p>{data.unverifiedSpotsCount}</p>
              </div>
            </div>
          </div>
        </TileBody>
      </Tile>
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Users</h2>
        </TileHeader>
        <TileBody>
          <div className="space-y-4">
            <p className="text-3xl">{data.userCount.toLocaleString()}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">Guides</p>
                <p>{data.guideCount}</p>
              </div>
              <div>
                <p className="text-sm">Members</p>
                <p>{data.memberCount}</p>
              </div>
            </div>
          </div>
        </TileBody>
      </Tile>
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Lists</h2>
        </TileHeader>
        <TileBody>
          <div className="space-y-4">
            <p className="text-3xl">{data.listCount.toLocaleString()}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">Public</p>
                <p>{data.publicListCount}</p>
              </div>
              <div>
                <p className="text-sm">Private</p>
                <p>{data.privateListCount}</p>
              </div>
            </div>
          </div>
        </TileBody>
      </Tile>
    </div>
  )
}
