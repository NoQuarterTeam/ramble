import * as React from "react"
import type { LngLatLike } from "react-map-gl"
import Map, { Marker } from "react-map-gl"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Link, useFetcher, useLoaderData, useNavigate } from "@remix-run/react"
import bbox from "@turf/bbox"
import * as turf from "@turf/helpers"
import { ChevronLeft, Copy } from "lucide-react"

import type { SpotType } from "@ramble/database/types"
import { ClientOnly, INITIAL_LATITUDE, INITIAL_LONGITUDE } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import { Button } from "~/components/ui"
import { db } from "~/lib/db.server"
import { FORM_ACTION } from "~/lib/form"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { badRequest, notFound, redirect } from "~/lib/remix.server"
import { SPOTS } from "~/lib/static/spots"
import { useTheme } from "~/lib/theme"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SpotItem } from "./components/SpotItem"

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const list = await db.list.findFirst({
    where: { id: params.id },
    select: {
      id: true,
      creatorId: true,
      creator: { select: { username: true, firstName: true, lastName: true } },
      name: true,
      description: true,
      listSpots: {
        select: {
          id: true,
          spot: {
            select: {
              id: true,
              type: true,
              reviews: { select: { rating: true } },
              name: true,
              address: true,
              latitude: true,
              longitude: true,
              images: { take: 1 },
            },
          },
        },
      },
    },
  })
  if (!list) throw notFound(null)

  const formattedList = {
    ...list,
    listSpots: list.listSpots.map((listSpot) => ({
      ...listSpot,
      spot: {
        ...listSpot.spot,
        image: listSpot.spot.images[0]?.path,
        blurHash: listSpot.spot.images[0]?.blurHash,
        rating:
          listSpot.spot.reviews.length > 0
            ? Math.round(listSpot.spot.reviews.reduce((acc, review) => acc + review.rating, 0) / listSpot.spot.reviews.length)
            : undefined,
      },
    })),
  }
  const coords =
    formattedList.listSpots.length > 1 ? formattedList.listSpots.map(({ spot }) => [spot.longitude, spot.latitude]) : null

  let bounds: LngLatLike | undefined = undefined
  if (coords) {
    const line = turf.lineString(coords)
    bounds = bbox(line) as unknown as LngLatLike
  }

  return json({ list: formattedList, bounds })
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
      if (!list) throw notFound(null)
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
  const { list, bounds } = useLoaderData<typeof loader>()
  const currentUser = useMaybeUser()
  const theme = useTheme()

  const navigate = useNavigate()
  const deleteFetcher = useFetcher()
  const copyFetcher = useFetcher()
  const markers = React.useMemo(
    () =>
      list.listSpots.map(({ spot }) => {
        const Icon = SPOTS[spot.type as SpotType].Icon
        return (
          <Marker
            key={spot.id}
            anchor="bottom"
            onClick={() => navigate(`/spots/${spot.id}`)}
            longitude={spot.longitude}
            latitude={spot.latitude}
          >
            <div className="relative cursor-pointer transition-transform hover:scale-110">
              <div className="sq-8 bg-primary-600 dark:bg-primary-700 border-primary-100 dark:border-primary-600 flex items-center justify-center rounded-full border shadow-md">
                <Icon className="sq-4 text-white" />
              </div>
              <div className="sq-3 bg-primary-600 dark:bg-primary-700 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow" />
            </div>
          </Marker>
        )
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [list.listSpots],
  )
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-end space-x-2">
            <div className="flex space-x-2">
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
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <div className="space-y-2">
          {list.listSpots.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <p>Nothing added yet</p>
            </div>
          ) : (
            list.listSpots.map(({ spot }) => <SpotItem key={spot.id} spot={spot} />)
          )}
        </div>
        <div className="sticky top-0 h-[400px] w-full overflow-hidden rounded-md">
          <ClientOnly>
            <Map
              mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
              style={{ height: "100%", width: "100%" }}
              initialViewState={
                bounds
                  ? { bounds, fitBoundsOptions: { padding: 50 } }
                  : {
                      latitude: list.listSpots.length === 0 ? INITIAL_LATITUDE : list.listSpots[0].spot.latitude,
                      longitude: list.listSpots.length === 0 ? INITIAL_LONGITUDE : list.listSpots[0].spot.longitude,
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
            </Map>
          </ClientOnly>
        </div>
      </div>
    </div>
  )
}
