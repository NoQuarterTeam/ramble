import { Suspense } from "react"
import Map, { Marker } from "react-map-gl"
import { defer, type SerializeFrom } from "@remix-run/node"
import { Await, Link, ShouldRevalidateFunctionArgs, useLoaderData } from "@remix-run/react"
import crypto from "crypto"
import dayjs from "dayjs"
import { Check, Edit2, Heart, Star, Trash } from "lucide-react"
import { promiseHash } from "remix-utils/promise"

import { FULL_WEB_URL } from "@ramble/server-env"
import { getSpotFlickrImages, publicSpotWhereClause } from "@ramble/server-services"
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
import { SpotTypeBadge } from "~/components/SpotTypeBadge"
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
import { createAction, createActions } from "~/lib/form.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { AMENITIES_ICONS } from "~/lib/models/amenities"
import { badRequest, json, notFound, redirect } from "~/lib/remix.server"
import { useTheme } from "~/lib/theme"
import { type ActionFunctionArgs, type LoaderFunctionArgs, type MetaFunction } from "~/lib/vendor/vercel.server"
import { VerifiedCard } from "~/pages/_main+/_app+/components/VerifiedCard"
import { type TranslateSpot } from "~/pages/api+/spots+/$id.translate.$lang"
import type { loader as rootLoader } from "~/root"
import { getCurrentUser, getMaybeUser } from "~/services/auth/auth.server"

import { SaveToList, Actions as SaveActions } from "../../api+/spots+/$id.save-to-list"
import { PartnerLink } from "./components/PartnerLink"
import { ReviewItem, reviewItemSelectFields } from "./components/ReviewItem"
import { SpotMarker } from "./components/SpotMarker"
import { TranslateSpotDescription } from "./components/TranslateSpotDescription"
import { FORM_ACTION } from "~/lib/form"

export const config = {
  // runtime: "edge",
  // regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

// export const headers = useLoaderHeaders

export const shouldRevalidate = ({ formData }: ShouldRevalidateFunctionArgs) => {
  if (formData?.get(FORM_ACTION) === SaveActions.ToggleSave) return false
  return true
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getMaybeUser(request)
  const spot = await db.spot.findUnique({
    where: { id: params.id, ...publicSpotWhereClause(user?.id) },
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
    },
  })
  if (!spot) throw notFound()

  const reviews = db.review
    .findMany({
      where: { spotId: params.id },
      orderBy: { createdAt: "desc" },
      select: reviewItemSelectFields,
    })
    .then((r) => r)

  const flickrImages = await getSpotFlickrImages(spot)

  let translatedDescription
  let descriptionHash
  if (user && spot.description) {
    const language = user.preferredLanguage
    descriptionHash = spot.description ? crypto.createHash("sha1").update(spot.description).digest("hex") : ""
    translatedDescription = descriptionHash
      ? (fetch(FULL_WEB_URL + `/api/spots/${spot.id}/translate/${language}?hash=${descriptionHash}`).then((r) =>
          r.json(),
        ) as Promise<TranslateSpot>)
      : null
  }

  const stats = promiseHash({
    rating: db.review
      .aggregate({ where: { spotId: params.id }, _avg: { rating: true } })
      .then((r) => r._avg.rating) as Promise<number>,
    listsCount: db.listSpot.count({ where: { spotId: params.id } }).then((r) => r) as Promise<number>,
  })

  const reviewCount = db.review.count({ where: { spotId: params.id } }).then((r) => r)
  const activitySpots = db.spot
    .findMany({
      where: {
        ...publicSpotWhereClause(user?.id),
        type: { in: activitySpotTypes },
        latitude: { gt: spot.latitude - 0.5, lt: spot.latitude + 0.5 },
        longitude: { gt: spot.longitude - 0.5, lt: spot.longitude + 0.5 },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    })
    .then((r) => r)
  return defer({ spot, stats, reviewCount, reviews, translatedDescription, activitySpots, descriptionHash, flickrImages })
}

export const meta: MetaFunction<typeof loader, { root: typeof rootLoader }> = ({ data, matches }) => {
  const parsedData = data as unknown as SerializeFrom<typeof loader>
  const FULL_WEB_URL = matches.find((r) => r.id === "root")?.data.config.FULL_WEB_URL || "localhost:3000"
  const image = parsedData?.spot.images[0]?.path
  return [
    { title: parsedData?.spot.name },
    { name: "description", content: parsedData?.spot.description },
    { name: "og:title", content: parsedData?.spot.name },
    { name: "og:description", content: parsedData?.spot.description },
    {
      name: "og:image",
      content: image ? FULL_WEB_URL + transformImageSrc(createImageUrl(image), { width: 600, height: 400 }) : null,
    },
  ]
}

enum Actions {
  Delete = "delete",
  Verify = "verify",
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true, isVerified: true, isAdmin: true })
  return createActions<Actions>(request, {
    verify: () =>
      createAction(request).handler(async () => {
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
      }),
    delete: () =>
      createAction(request).handler(async () => {
        try {
          if (!user.isAdmin) return redirect("/spots")
          await db.spot.update({ where: { id: params.id }, data: { deletedAt: new Date() } })
          track("Spot deleted", { spotId: params.id || "", userId: user.id })
          return redirect("/spots", request, { flash: { title: "Spot deleted!" } })
        } catch (error) {
          return badRequest("Error deleting spot your account", request, { flash: { title: "Error deleting spot" } })
        }
      }),
  })
}

export default function SpotDetail() {
  const { spot, stats, reviewCount, reviews, activitySpots, translatedDescription, descriptionHash, flickrImages } =
    useLoaderData<typeof loader>()
  const user = useMaybeUser()
  const theme = useTheme()

  return (
    <div className="relative">
      <div className="w-screen overflow-x-scroll">
        <div className="flex w-max gap-2 p-2">
          {flickrImages
            ? flickrImages.map((photo) => (
                <a
                  key={photo.id}
                  href={photo.link}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="relative hover:opacity-80"
                >
                  <img src={photo.src} width={400} height={300} className="rounded-xs h-[300px] max-w-[400px] object-cover" />
                  <img src="/flickr.svg" className="absolute bottom-1 left-1 object-contain" width={100} />
                </a>
              ))
            : spot.images.map((image) => (
                <OptimizedImage
                  alt="spot"
                  key={image.id}
                  placeholder={image.blurHash}
                  src={createImageUrl(image.path)}
                  className="rounded-xs h-[300px] max-w-[400px]"
                  height={400}
                  width={600}
                />
              ))}
        </div>
      </div>
      <PageContainer className="space-y-10 pb-40 pt-4 lg:pt-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <SpotTypeBadge spot={spot} />
              <div className="flex items-center space-x-1">{user && <SaveToList spotId={spot.id} />}</div>
            </div>
            <h1 className="text-lg md:text-2xl lg:text-3xl">{spot.name}</h1>

            <Suspense fallback={<div className="h-6" />}>
              <Await resolve={stats}>
                {({ listsCount, rating }) => (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="sq-4" />
                      <p>{displayRating(rating)}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="sq-4" />
                      <p>{listsCount || 0}</p>
                    </div>
                  </div>
                )}
              </Await>
            </Suspense>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {isPartnerSpot(spot) ? <PartnerLink spot={spot} /> : <VerifiedCard spot={spot} />}
              <TranslateSpotDescription
                key={spot.id}
                spot={spot}
                translatedDescription={translatedDescription}
                hash={descriptionHash}
              />

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
                        <FormButton value={Actions.Verify} leftIcon={<Check className="sq-3" />}>
                          Verify
                        </FormButton>
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
                          <FormButton value={Actions.Delete}>Confirm</FormButton>
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
                <Suspense>
                  <Await resolve={activitySpots}>
                    {(spots) =>
                      spots.map((activitySpot) => (
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
                      ))
                    }
                  </Await>
                </Suspense>
              </Map>
            </div>
          </div>
        </div>

        <hr />

        <div className="space-y-2">
          <div id="reviews" className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Suspense>
                <Await resolve={reviewCount}>
                  {(val) => (
                    <p className="text-xl">
                      {val} {val === 1 ? "review" : "reviews"}
                    </p>
                  )}
                </Await>
              </Suspense>
              <p>·</p>
              <div className="flex items-center space-x-1">
                <Star className="sq-5" />
                <Suspense fallback={<p className="pt-1"> </p>}>
                  <Await resolve={stats}>{(val) => <p className="pt-1">{displayRating(val.rating)}</p>}</Await>
                </Suspense>
              </div>
            </div>
            {user && (
              <LinkButton variant="secondary" to="reviews/new">
                Add review
              </LinkButton>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Suspense>
              <Await resolve={reviews}>{(val) => val.map((review) => <ReviewItem key={review.id} review={review} />)}</Await>
            </Suspense>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
