import * as React from "react"
import type { LngLatLike } from "react-map-gl"
import Map, { Marker, NavigationControl } from "react-map-gl"
import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import bbox from "@turf/bbox"
import * as turf from "@turf/helpers"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { ChevronLeft, Copy } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import type { SpotItemWithStats } from "@ramble/api/src/router/spot"
import { ClientOnly, INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { PageContainer } from "~/components/PageContainer"
import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FORM_ACTION } from "~/lib/form"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { badRequest, notFound, redirect } from "~/lib/remix.server"
import { useTheme } from "~/lib/theme"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotItem } from "./components/SpotItem"
import { SpotMarker } from "./components/SpotMarker"

export const headers = useLoaderHeaders

type SpotItemWithStatsAndCoords = SpotItemWithStats & { longitude: number; latitude: number }
export const loader = async ({ params }: LoaderArgs) => {
  const [list, spots] = await Promise.all([
    db.list.findFirst({
      where: { id: params.id },
      select: {
        id: true,
        creatorId: true,
        creator: { select: { username: true, firstName: true, lastName: true } },
        name: true,
        description: true,
      },
    }),
    db.$queryRaw<SpotItemWithStatsAndCoords[]>`
      SELECT 
        Spot.id, Spot.name, Spot.type, Spot.address, AVG(Review.rating) as rating,
        Spot.latitude, Spot.longitude,
        (SELECT path FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS image,
        (SELECT blurHash FROM SpotImage WHERE SpotImage.spotId = Spot.id ORDER BY createdAt DESC LIMIT 1) AS blurHash,
        (CAST(COUNT(ListSpot.spotId) as CHAR(32))) AS savedCount
      FROM
        Spot
      LEFT JOIN
        Review ON Spot.id = Review.spotId
      LEFT JOIN
        ListSpot ON Spot.id = ListSpot.spotId
      WHERE
        ListSpot.listId = ${params.id} AND Spot.deletedAt IS NULL
      GROUP BY
        Spot.id
      ORDER BY
        Spot.id
    `,
  ])
  if (!list) throw notFound()

  const coords = spots.length > 1 ? spots.map((spot) => [spot.longitude, spot.latitude]) : null

  let bounds: LngLatLike | undefined = undefined
  if (coords) {
    const line = turf.lineString(coords)
    bounds = bbox(line) as unknown as LngLatLike
  }

  return json(
    { list, spots, bounds },
    { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1hour", sMaxage: "1hour" }) } },
  )
}

enum Actions {
  Delete = "Delete",
  Copy = "Copy",
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request)
  const formData = await request.formData()
  const action = formData.get(FORM_ACTION) as Actions

  switch (action) {
    case Actions.Delete:
      await db.list.delete({ where: { id: params.id } })
      return redirect(`/${user.username}/lists`, request, { flash: { title: "List deleted" } })
    case Actions.Copy:
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
    default:
      throw badRequest("Invald action")
  }
}

export default function ListDetail() {
  const { list, spots, bounds } = useLoaderData<typeof loader>()
  const currentUser = useMaybeUser()
  const theme = useTheme()

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
      <div className="top-nav sticky z-[1] flex flex-col items-start justify-between bg-white py-4 dark:bg-gray-800 md:flex-row">
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
              <copyFetcher.Form method="post" replace>
                <Button
                  leftIcon={<Copy className="sq-4" />}
                  isLoading={copyFetcher.state === "submitting"}
                  name={FORM_ACTION}
                  value={Actions.Copy}
                  type="submit"
                  variant="outline"
                >
                  Copy
                </Button>
              </copyFetcher.Form>
            )}

            {currentUser.id === list.creatorId && (
              <>
                <LinkButton to="edit" variant="outline">
                  Edit
                </LinkButton>
                <deleteFetcher.Form method="post" replace>
                  <Button
                    type="submit"
                    isLoading={deleteFetcher.state === "submitting"}
                    name={FORM_ACTION}
                    value={Actions.Delete}
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </deleteFetcher.Form>
              </>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="scrollbar-hide col-span-12 space-y-4 overflow-y-scroll md:col-span-4 md:h-[80vh] md:pb-20">
          {spots.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p>Nothing added yet</p>
            </div>
          ) : (
            spots.map((spot) => <SpotItem key={spot.id} spot={spot} />)
          )}
        </div>
        <div className="col-span-12 h-[80vh] w-full overflow-hidden rounded-md pb-4 md:col-span-8 md:pb-0">
          <ClientOnly>
            <Map
              doubleClickZoom={true}
              scrollZoom={false}
              mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
              style={{ height: "100%", width: "100%" }}
              initialViewState={
                bounds
                  ? { bounds, fitBoundsOptions: { padding: 50 } }
                  : {
                      latitude: spots[0]?.latitude || INITIAL_LATITUDE,
                      longitude: spots[0]?.longitude || INITIAL_LONGITUDE,
                      zoom: 10,
                    }
              }
              attributionControl={false}
              mapStyle={
                theme === "dark"
                  ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
                  : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
              }
            >
              {markers}
              <NavigationControl position="bottom-right" />
            </Map>
          </ClientOnly>
        </div>
      </div>
    </PageContainer>
  )
}
