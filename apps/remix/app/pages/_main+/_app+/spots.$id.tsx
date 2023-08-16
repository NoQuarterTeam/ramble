import Map, { Marker } from "react-map-gl"
import { Link, useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs, V2_MetaFunction } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Edit2, Star, Trash } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"

import type { SpotType } from "@ramble/database/types"
import { AMENITIES, canManageSpot, createImageUrl } from "@ramble/shared"

import { Form, FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { OptimizedImage, transformImageSrc } from "~/components/OptimisedImage"
import { PageContainer } from "~/components/PageContainer"
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
import { VerifiedCard } from "~/components/VerifiedCard"
import { db } from "~/lib/db.server"
import { useLoaderHeaders } from "~/lib/headers.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound, redirect } from "~/lib/remix.server"
import { AMENITIES_ICONS } from "~/lib/static/amenities"
import { SPOTS } from "~/lib/static/spots"
import { useTheme } from "~/lib/theme"
import type { loader as rootLoader } from "~/root"
import { getCurrentUser } from "~/services/auth/auth.server"

import { SaveToList } from "../../api+/save-to-list"
import { ReviewItem, reviewItemSelectFields } from "./components/ReviewItem"

export const config = {
  runtime: "edge",
  regions: ["fra1", "cdg1", "dub1", "arn1", "lhr1"],
}

export const headers = useLoaderHeaders

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      type: true,
      verifiedAt: true,
      amenities: true,
      address: true,
      description: true,
      latitude: true,
      longitude: true,
      ownerId: true,
      verifier: { select: { firstName: true, username: true, lastName: true, avatar: true, avatarBlurHash: true } },
      images: { orderBy: { createdAt: "asc" }, select: { id: true, path: true, blurHash: true } },
      _count: { select: { reviews: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: reviewItemSelectFields,
      },
    },
  })
  if (!spot) throw notFound()

  const rating = await db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } })

  return json(
    { ...spot, rating },
    { headers: { "Cache-Control": cacheHeader({ public: true, maxAge: "1day", sMaxage: "1day" }) } },
  )
}

export const meta: V2_MetaFunction<typeof loader, { root: typeof rootLoader }> = ({ data, matches }) => {
  const WEB_URL = matches.find((r) => r.id === "root")?.data.config.WEB_URL || "localhost:3000"
  const image = data?.images[0]?.path
  return [
    { title: data?.name },
    { name: "description", content: data?.description },
    { name: "og:title", content: data?.name },
    { name: "og:description", content: data?.description },
    {
      name: "og:image",
      content: image ? WEB_URL + transformImageSrc(createImageUrl(image), { width: 600, height: 400 }) : null,
    },
  ]
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true, isVerified: true, isAdmin: true })
  const spot = await db.spot.findUniqueOrThrow({ where: { id: params.id }, select: { ownerId: true } })
  if (!canManageSpot(spot, user)) return redirect("/latest")
  await db.spot.delete({ where: { id: params.id } })
  return redirect("/latest", request, { flash: { title: "Spot deleted!" } })
}

export default function SpotDetail() {
  const spot = useLoaderData<typeof loader>()
  const user = useMaybeUser()
  const theme = useTheme()

  const Icon = SPOTS[spot.type as SpotType].Icon
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
              className="h-[300px] max-w-[400px] rounded-md"
              height={300}
              width={400}
            />
          ))}
        </div>
      </div>
      <PageContainer className="space-y-10 pb-40">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-col items-start justify-between space-y-1 md:flex-row">
              <h1 className="text-4xl">{spot.name}</h1>
              <div className="flex items-center space-x-1">{user && <SaveToList spotId={spot.id} />}</div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <Star className="sq-5" />
              <p>{spot.rating._avg.rating ? spot.rating._avg.rating?.toFixed(1) : "Not rated"}</p>
              <p>·</p>
              <Link to="#reviews" className="hover:underline">
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <VerifiedCard spot={spot} />
              <h3 className="text-lg font-medium">Description</h3>
              <p className="whitespace-pre-wrap">{spot.description}</p>
              <p className="text-sm italic">{spot.address}</p>
              {spot.amenities && (
                <div className="flex flex-row flex-wrap gap-2">
                  {Object.entries(AMENITIES).map(([key, value]) => {
                    if (!spot.amenities?.[key as keyof typeof AMENITIES]) return null
                    const Icon = AMENITIES_ICONS[key as keyof typeof AMENITIES_ICONS]
                    return (
                      <div key={key} className="flex space-x-1 rounded-md border border-gray-200 p-2 dark:border-gray-700">
                        {Icon && <Icon size={20} />}
                        <p className="text-sm">{value}</p>
                      </div>
                    )
                  })}
                </div>
              )}
              {canManageSpot(spot, user) && (
                <div className="flex space-x-2">
                  <LinkButton to="edit" leftIcon={<Edit2 className="sq-3" />}>
                    Edit
                  </LinkButton>
                  <AlertDialogRoot>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" leftIcon={<Trash className="sq-3" />}>
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
                          <FormButton>Confirm</FormButton>
                        </Form>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogRoot>
                </div>
              )}
            </div>

            <div className="z-10 h-[400px] w-full overflow-hidden rounded-md">
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
                  <div className="relative">
                    <div className="sq-8 bg-primary-600 dark:bg-primary-700 border-primary-100 dark:border-primary-600 flex items-center justify-center rounded-full border shadow-md">
                      <Icon className="sq-4 text-white" />
                    </div>
                    <div className="sq-3 bg-primary-600 dark:bg-primary-700 absolute -bottom-[3px] left-1/2 -z-[1] -translate-x-1/2 rotate-45 shadow" />
                  </div>
                </Marker>
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
                <p className="pt-1">{spot.rating._avg.rating?.toFixed(1)}</p>
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
