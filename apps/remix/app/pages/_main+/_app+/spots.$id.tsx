import Map, { Marker } from "react-map-gl"
import { Link, useLoaderData } from "@remix-run/react"
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@vercel/remix"
import dayjs from "dayjs"
import { Check, Edit2, Heart, Star, Trash } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { promiseHash } from "remix-utils/promise"

import { publicSpotWhereClause } from "@ramble/api"
import {
  activitySpotTypes,
  AMENITIES,
  amenitiesFields,
  canManageSpot,
  createImageUrl,
  displayRating,
  isPartnerSpot,
  spotPartnerFields,
} from "@ramble/shared"

import { Form, FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage, transformImageSrc } from "~/components/OptimisedImage"
import { PageContainer } from "~/components/PageContainer"
import { SpotIcon } from "~/components/SpotIcon"
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "~/components/ui"
import { track } from "~/lib/analytics.server"
import { db } from "~/lib/db.server"
import { FormActionInput, getFormAction } from "~/lib/form"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { AMENITIES_ICONS } from "~/lib/models/amenities"
import { badRequest, json, notFound, redirect } from "~/lib/remix.server"
import { useTheme } from "~/lib/theme"
import { VerifiedCard } from "~/pages/_main+/_app+/components/VerifiedCard"
import type { loader as rootLoader } from "~/root"
import { getCurrentUser } from "~/services/auth/auth.server"
import { getUserSession } from "~/services/session/session.server"

import { SaveToList } from "../../api+/save-to-list"
import { PartnerLink } from "./components/PartnerLink"
import { ReviewItem, reviewItemSelectFields } from "./components/ReviewItem"
import { SpotMarker } from "./components/SpotMarker"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { userId } = await getUserSession(request)

  const { spot, rating } = await promiseHash({
    spot: db.spot.findUnique({
      where: { id: params.id, ...publicSpotWhereClause(userId) },
      select: {
        id: true,
        name: true,
        type: true,
        verifiedAt: true,
        amenities: { select: amenitiesFields },
        address: true,
        description: true,
        latitude: true,
        longitude: true,
        ownerId: true,
        ...spotPartnerFields,
        createdAt: true,
        creator: { select: { firstName: true, username: true, lastName: true } },
        verifier: { select: { firstName: true, username: true, lastName: true, avatar: true, avatarBlurHash: true } },
        images: { orderBy: { createdAt: "desc" }, select: { id: true, path: true, blurHash: true } },
        _count: { select: { reviews: true, listSpots: true } },
        reviews: { take: 5, orderBy: { createdAt: "desc" }, select: reviewItemSelectFields },
      },
    }),
    rating: db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } }),
  })
  if (!spot) throw notFound()

  const activitySpots = await db.spot.findMany({
    where: {
      ...publicSpotWhereClause(userId),
      type: { in: activitySpotTypes },
      latitude: { gt: spot.latitude - 0.5, lt: spot.latitude + 0.5 },
      longitude: { gt: spot.longitude - 0.5, lt: spot.longitude + 0.5 },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  return json({ spot: { ...spot, rating }, activitySpots }, request, {
    headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1day", sMaxage: "1day", staleWhileRevalidate: "30min" }) },
  })
}

export const meta: MetaFunction<typeof loader, { root: typeof rootLoader }> = ({ data, matches }) => {
  const WEB_URL = matches.find((r) => r.id === "root")?.data.config.WEB_URL || "localhost:3000"
  const image = data?.spot.images[0]?.path
  return [
    { title: data?.spot.name },
    { name: "description", content: data?.spot.description },
    { name: "og:title", content: data?.spot.name },
    { name: "og:description", content: data?.spot.description },
    {
      name: "og:image",
      content: image ? WEB_URL + transformImageSrc(createImageUrl(image), { width: 600, height: 400 }) : null,
    },
  ]
}

enum Actions {
  Delete = "delete",
  Verify = "verify",
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true, isVerified: true, isAdmin: true })
  const formAction = await getFormAction<Actions>(request)

  switch (formAction) {
    case Actions.Delete:
      try {
        if (!user.isAdmin) return redirect("/spots")
        await db.spot.delete({ where: { id: params.id } })
        track("Spot deleted", { spotId: params.id || "", userId: user.id })
        return redirect("/spots", request, { flash: { title: "Spot deleted!" } })
      } catch (error) {
        return badRequest("Error deleting spot your account", request, { flash: { title: "Error deleting spot" } })
      }
    case Actions.Verify:
      try {
        const spot = await db.spot.findUniqueOrThrow({
          where: { id: params.id },
          select: { id: true, ownerId: true, deletedAt: true },
        })
        if (!canManageSpot(spot, user)) return redirect("/spots")
        await db.spot.update({
          where: { id: params.id },
          data: { verifiedAt: new Date(), verifier: { connect: { id: user.id } } },
        })
        track("Spot verified", { spotId: spot.id, userId: user.id })
        return json({ success: true }, request, { flash: { title: "Spot verified!" } })
      } catch (error) {
        return badRequest("Error verifying spot", request, { flash: { title: "Error verifying spot" } })
      }
    default:
      return badRequest("Invalid action")
  }
}

export default function SpotDetail() {
  const { spot, activitySpots } = useLoaderData<typeof loader>()
  const user = useMaybeUser()
  const theme = useTheme()

  return (
    <div className="relative">
      <div className="w-screen overflow-x-scroll">
        <div className="flex w-max gap-2 p-2">
          {spot.images.map((image) => (
            <OptimizedImage
              alt="spot"
              key={image.id}
              placeholder={image.blurHash}
              src={createImageUrl(image.path)}
              className="rounded-xs h-[300px] max-w-[400px]"
              height={300}
              width={400}
            />
          ))}
        </div>
      </div>
      <PageContainer className="space-y-10 pb-40 pt-4 lg:pt-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col items-start justify-between space-y-1 md:flex-row">
              <div className="flex items-center space-x-2">
                <div className="sq-8 md:sq-16 flex flex-shrink-0 items-center justify-center rounded-full border border-gray-200 dark:border-gray-600">
                  <SpotIcon type={spot.type} className="sq-4 md:sq-6" />
                </div>
                <h1 className="text-lg md:text-2xl lg:text-3xl">{spot.name}</h1>
              </div>
              <div className="flex items-center space-x-1">{user && <SaveToList spotId={spot.id} />}</div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm">
                <Star className="sq-4" />
                <p>{displayRating(spot.rating._avg.rating)}</p>
              </div>
              <div className="flex items-center space-x-1 text-sm">
                <Heart className="sq-4" />
                <p>{spot._count.listSpots || 0}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}
              <h3 className="text-lg font-medium">Description</h3>
              <p className="whitespace-pre-wrap">{spot.description}</p>
              <p className="text-sm italic">{spot.address}</p>
              {spot.amenities && (
                <div className="flex flex-row flex-wrap gap-2">
                  {Object.entries(AMENITIES).map(([key, value]) => {
                    if (!spot.amenities?.[key as keyof typeof AMENITIES]) return null
                    const Icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                    return (
                      <div key={key} className="rounded-xs flex space-x-1 border border-gray-200 p-2 dark:border-gray-700">
                        {Icon && <Icon size={20} />}
                        <p className="text-sm">{value}</p>
                      </div>
                    )
                  })}
                </div>
              )}
              <p>
                Added by{" "}
                <Link to={`/${spot.creator.username}`} className="hover:underline">
                  {spot.creator.firstName} {spot.creator.lastName}
                </Link>{" "}
                on the {dayjs(spot.createdAt).format("DD/MM/YYYY")}
              </p>
              <div className="flex space-x-2">
                {canManageSpot(spot, user) && (
                  <>
                    {!spot.verifiedAt && (
                      <Form>
                        <FormActionInput value={Actions.Verify} />
                        <FormButton leftIcon={<Check className="sq-3" />}>Verify</FormButton>
                      </Form>
                    )}
                    <LinkButton to="edit" variant="outline" leftIcon={<Edit2 className="sq-3" />}>
                      Edit
                    </LinkButton>
                  </>
                )}
                {user?.isAdmin && (
                  <AlertDialogRoot>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive-secondary" leftIcon={<Trash className="sq-3" />}>
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button variant="ghost">Cancel</Button>
                        </AlertDialogCancel>
                        <Form>
                          <FormActionInput value={Actions.Delete} />
                          <FormButton>Confirm</FormButton>
                        </Form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogRoot>
                )}
              </div>
            </div>

            <div className="rounded-xs h-[400px] w-full overflow-hidden">
              <Map
                mapboxAccessToken="pk.eyJ1IjoiamNsYWNrZXR0IiwiYSI6ImNpdG9nZDUwNDAwMTMyb2xiZWp0MjAzbWQifQ.fpvZu03J3o5D8h6IMjcUvw"
                style={{ height: "100%", width: "100%" }}
                initialViewState={{ latitude: spot.latitude, longitude: spot.longitude, zoom: 10 }}
                attributionControl={false}
                mapStyle={
                  theme === "dark"
                    ? "mapbox://styles/jclackett/clh82otfi00ay01r5bftedls1"
                    : "mapbox://styles/jclackett/clh82jh0q00b601pp2jfl30sh"
                }
              >
                <Marker anchor="bottom" longitude={spot.longitude} latitude={spot.latitude}>
                  <SpotMarker spot={spot} isInteractable={false} />
                </Marker>
                {activitySpots.map((activitySpot) => (
                  <Marker
                    key={activitySpot.id}
                    anchor="bottom"
                    longitude={activitySpot.longitude}
                    latitude={activitySpot.latitude}
                  >
                    <a href={`/spots/${activitySpot.id}`} target="_blank" rel="noopener noreferrer">
                      <SpotMarker spot={activitySpot} />
                    </a>
                  </Marker>
                ))}
              </Map>
            </div>
          </div>
        </div>

        <hr />

        <div className="space-y-2">
          <div id="reviews" className="flex justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-xl">
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </p>
              <p>·</p>
              <div className="flex items-center space-x-1">
                <Star className="sq-5" />
                <p className="pt-1">{displayRating(spot.rating._avg.rating)}</p>
              </div>
            </div>
            {user && (
              <LinkButton variant="secondary" to="reviews/new">
                Add review
              </LinkButton>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {spot.reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
