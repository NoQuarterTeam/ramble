import * as React from "react"
import type { LngLatLike } from "react-map-gl"
import { Marker } from "react-map-gl"
import { Link, useLoaderData, useNavigate } from "@remix-run/react"
import { ChevronLeft, Copy } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { ClientOnly } from "remix-utils/client-only"
import { promiseHash } from "remix-utils/promise"

import { publicSpotWhereClauseRaw, spotItemDistanceFromMeField, spotItemSelectFields } from "@ramble/server-services"
import { INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"
import { type SpotItemType } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { Map } from "~/components/Map"
import { PageContainer } from "~/components/PageContainer"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { createAction, createActions } from "~/lib/form.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { fetchAndJoinSpotImages } from "~/lib/models/spot"
import { notFound, redirect } from "~/lib/remix.server"
import { bbox, lineString } from "~/lib/vendor/turf.server"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "~/lib/vendor/vercel.server"
import { json } from "~/lib/vendor/vercel.server"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotItem } from "./components/SpotItem"
import { SpotMarker } from "./components/SpotMarker"

export const headers = useLoaderHeaders

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, username: true, latitude: true, longitude: true })

  const { list, spots } = await promiseHash({
    list: db.list.findFirst({
      where: { id: params.id, isPrivate: user.username !== params.username ? false : undefined },
      select: {
        id: true,
        creatorId: true,
        creator: { select: { username: true, firstName: true, lastName: true } },
        name: true,
        description: true,
      },
    }),
    spots: db.$queryRaw<SpotItemType[]>`
      SELECT 
       ${spotItemDistanceFromMeField(user)},
       ${spotItemSelectFields}
      FROM
        Spot
      LEFT JOIN
        ListSpot ON Spot.id = ListSpot.spotId
      WHERE
        ListSpot.listId = ${params.id} AND ${publicSpotWhereClauseRaw(user?.id)}
      GROUP BY
        Spot.id
      ORDER BY
        Spot.id
    `,
  })
  if (!list) throw notFound()

  await fetchAndJoinSpotImages(spots)

  const coords = spots.length > 1 ? spots.map((spot) => [spot.longitude, spot.latitude]) : null

  let bounds: LngLatLike | undefined = undefined
  if (coords) {
    const line = lineString(coords)
    bounds = bbox(line) as unknown as LngLatLike
  }

  return json(
    { list, spots, bounds },
    {
      headers: {
        "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour", staleWhileRevalidate: "1min" }),
      },
    },
  )
}

enum Actions {
  Delete = "delete",
  Copy = "copy",
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request)
  return createActions<Actions>(request, {
    copy: () =>
      createAction(request).handler(async () => {
        const list = await db.list.findFirst({ where: { id: params.id }, include: { listSpots: true } })
        if (!list) throw notFound()
        const newList = await db.list.create({
          data: {
            name: list.name,
            description: list.description,
            creator: { connect: { id: user.id } },
            listSpots: { createMany: { data: list.listSpots.map(({ spotId }) => ({ spotId })) } },
          },
        })
        return redirect(`/${user.username}/lists/${newList.id}`, request, { flash: { title: "List copied" } })
      }),
    delete: () =>
      createAction(request).handler(async () => {
        await db.list.delete({ where: { id: params.id } })
        track("List deleted", { listId: params.id || null, userId: user.id })
        return redirect(`/${user.username}/lists`, request, { flash: { title: "List deleted" } })
      }),
  })
}

export default function ListDetail() {
  const { list, spots, bounds } = useLoaderData<typeof loader>()
  const currentUser = useMaybeUser()

  const navigate = useNavigate()
  const deleteFetcher = useFetcher()
  const copyFetcher = useFetcher()
  const markers = React.useMemo(
    () =>
      spots.map((spot) => {
        return (
          <Marker
            key={spot.id}
            anchor="bottom"
            onClick={() => navigate(`/spots/${spot.id}`)}
            longitude={spot.longitude}
            latitude={spot.latitude}
          >
            <SpotMarker spot={spot} />
          </Marker>
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spots],
  )
  return (
    <PageContainer className="space-y-0 pb-0 pt-0">
      <div className="top-nav bg-background sticky z-[1] flex flex-col items-start justify-between py-4 md:flex-row">
        <div className="space-y-1">
          <div className="flex flex-col items-start md:flex-row md:items-end md:space-x-2">
            <div className="flex flex-col md:flex-row md:space-x-2">
              <LinkButton
                size="sm"
                leftIcon={<ChevronLeft className="sq-3" />}
                // @ts-expect-error remix accepts numbers
                to={-1}
                variant="outline"
              >
                Back
              </LinkButton>
              <h1 className="text-3xl">{list.name}</h1>
            </div>
            <Link to={`/${list.creator.username}`} className="hover:underline">
              by {list.creator.firstName} {list.creator.lastName}
            </Link>
          </div>
          <p>{list.description}</p>
        </div>
        {!!currentUser && (
          <div className="flex space-x-1">
            {currentUser.id !== list.creatorId && (
              <copyFetcher.Form>
                <copyFetcher.FormButton value={Actions.Copy} leftIcon={<Copy className="sq-4" />} variant="outline">
                  Copy
                </copyFetcher.FormButton>
              </copyFetcher.Form>
            )}

            {currentUser.id === list.creatorId && (
              <>
                <LinkButton to="edit" variant="outline">
                  Edit
                </LinkButton>
                <deleteFetcher.Form>
                  <deleteFetcher.FormButton value={Actions.Delete} variant="destructive">
                    Delete
                  </deleteFetcher.FormButton>
                </deleteFetcher.Form>
              </>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="scrollbar-hide col-span-12 space-y-4 overflow-y-scroll md:col-span-4 md:h-[80vh] md:pb-20">
          {spots.length === 0 ? (
            <div className="center py-10">
              <p>Nothing added yet</p>
            </div>
          ) : (
            spots.map((spot) => <SpotItem key={spot.id} spot={spot} />)
          )}
        </div>
        <div className="rounded-xs col-span-12 h-[80vh] w-full overflow-hidden pb-4 md:col-span-8 md:pb-0">
          <ClientOnly>
            {() => (
              <Map
                doubleClickZoom={true}
                scrollZoom={false}
                initialViewState={
                  bounds
                    ? { bounds, fitBoundsOptions: { padding: 50 } }
                    : {
                        latitude: spots[0]?.latitude || INITIAL_LATITUDE,
                        longitude: spots[0]?.longitude || INITIAL_LONGITUDE,
                        zoom: 10,
                      }
                }
              >
                {markers}
              </Map>
            )}
          </ClientOnly>
        </div>
      </div>
    </PageContainer>
  )
}
