import { Await, useLoaderData } from "@remix-run/react"
import { cacheHeader } from "pretty-cache-header"
import * as React from "react"

import { Spinner, Tile, TileBody, TileHeader } from "~/components/ui"
import { db } from "~/lib/db.server"
import { defer } from "~/lib/vendor/vercel.server"

export const loader = async () => {
  return defer(
    {
      spotCount: db.spot.count({ where: { deletedAt: null } }).then((r) => r),
      verifiedSpotCount: db.spot.count({ where: { deletedAt: null, verifiedAt: { not: null } } }).then((r) => r),
      unverifiedSpotsCount: db.spot.count({ where: { deletedAt: null, verifiedAt: null } }).then((r) => r),
      userCount: db.user.count().then((r) => r),
      guideCount: db.user.count({ where: { role: "GUIDE" } }).then((r) => r),
      memberCount: db.user.count({ where: { role: "MEMBER" } }).then((r) => r),
      listCount: db.list.count().then((r) => r),
      privateListCount: db.list.count({ where: { isPrivate: true } }).then((r) => r),
      publicListCount: db.list.count({ where: { isPrivate: false } }).then((r) => r),
      tripCount: db.trip.count().then((r) => r),
    },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, maxAge: "1h", sMaxage: "1h" }),
      },
    },
  )
}

export default function AdminHome() {
  const promise = useLoaderData<typeof loader>()
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Spots</h2>
        </TileHeader>
        <TileBody>
          <div className="space-y-4">
            <React.Suspense fallback={<Spinner />}>
              <p className="text-3xl">
                <Await resolve={promise.spotCount}>{(data) => data.toLocaleString()}</Await>
              </p>
            </React.Suspense>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">Verified</p>
                <React.Suspense fallback={<Spinner />}>
                  <p>
                    <Await resolve={promise.verifiedSpotCount}>{(data) => data}</Await>
                  </p>
                </React.Suspense>
              </div>
              <div>
                <p className="text-sm">Unverified</p>
                <React.Suspense fallback={<Spinner />}>
                  <p>
                    <Await resolve={promise.unverifiedSpotsCount}>{(data) => data}</Await>
                  </p>
                </React.Suspense>
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
            <React.Suspense fallback={<Spinner />}>
              <p className="text-3xl">
                <Await resolve={promise.userCount}>{(data) => data.toLocaleString()}</Await>
              </p>
            </React.Suspense>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">Guides</p>
                <React.Suspense fallback={<Spinner />}>
                  <p>
                    <Await resolve={promise.guideCount}>{(data) => data}</Await>
                  </p>
                </React.Suspense>
              </div>
              <div>
                <p className="text-sm">Members</p>
                <React.Suspense fallback={<Spinner />}>
                  <p>
                    <Await resolve={promise.memberCount}>{(data) => data}</Await>
                  </p>
                </React.Suspense>
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
            <React.Suspense fallback={<Spinner />}>
              <p className="text-3xl">
                <Await resolve={promise.listCount}>{(data) => data.toLocaleString()}</Await>
              </p>
            </React.Suspense>
            <div className="flex gap-4">
              <div>
                <p className="text-sm">Public</p>
                <React.Suspense fallback={<Spinner />}>
                  <p>
                    <Await resolve={promise.publicListCount}>{(data) => data}</Await>
                  </p>
                </React.Suspense>
              </div>
              <div>
                <p className="text-sm">Private</p>
                <React.Suspense fallback={<Spinner />}>
                  <p>
                    <Await resolve={promise.privateListCount}>{(data) => data}</Await>
                  </p>
                </React.Suspense>
              </div>
            </div>
          </div>
        </TileBody>
      </Tile>
      <Tile>
        <TileHeader>
          <h2 className="font-normal">Trips</h2>
        </TileHeader>
        <TileBody>
          <div className="space-y-4">
            <React.Suspense fallback={<Spinner />}>
              <p className="text-3xl">
                <Await resolve={promise.tripCount}>{(data) => data.toLocaleString()}</Await>
              </p>
            </React.Suspense>
          </div>
        </TileBody>
      </Tile>
    </div>
  )
}
