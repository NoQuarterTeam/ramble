import Map, { Marker } from "react-map-gl"
import { Form, useLoaderData } from "@remix-run/react"
import type { ActionArgs, LinksFunction, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Edit2, Heart, Share, Star, Verified } from "lucide-react"
import mapStyles from "mapbox-gl/dist/mapbox-gl.css"

import type { SpotType } from "@ramble/database/types"
import { ClientOnly, createImageUrl } from "@ramble/shared"
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@ramble/ui"

import { FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { PageContainer } from "~/components/PageContainer"
import { db } from "~/lib/db.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound, redirect } from "~/lib/remix.server"
import { canManageSpot, SPOTS } from "~/lib/spots"
import { useTheme } from "~/lib/theme"
import { getCurrentUser } from "~/services/auth/auth.server"

import { ReviewItem } from "./components/ReviewItem"

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: mapStyles }]
}

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      type: true,
      verifiedAt: true,
      address: true,
      description: true,
      latitude: true,
      longitude: true,
      ownerId: true,
      images: { select: { id: true, path: true } },
      _count: { select: { reviews: true } },
      reviews: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          createdAt: true,
          spotId: true,
          rating: true,
          description: true,
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      },
    },
  })
  if (!spot) throw notFound()

  const rating = await db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } })

  return json({ ...spot, rating })
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true })
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
      {canManageSpot(spot, user) && (
        <div className="absolute left-10 top-10 flex space-x-2">
          <LinkButton to="edit" leftIcon={<Edit2 className="sq-4" />}>
            Edit
          </LinkButton>
          <AlertDialogRoot>
            <AlertDialogTrigger asChild>{<Button variant="destructive">Delete</Button>}</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="ghost">Cancel</Button>
                </AlertDialogCancel>
                <Form method="post" replace>
                  <FormButton>Confirm</FormButton>
                </Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogRoot>
        </div>
      )}
      <div className="flex gap-2 overflow-scroll p-2">
        {spot.images.map((image) => (
          <img
            alt="spot"
            key={image.id}
            src={createImageUrl(image.path)}
            className="h-[300px] w-[400px] rounded-md object-cover"
            height={300}
            width={400}
          />
        ))}
      </div>
      <PageContainer className="space-y-10 pb-40">
        <div className="flex justify-between">
          <div>
            <h1 className="text-4xl">
              <span>{spot.name}</span>
              {spot.verifiedAt && <Verified className="sq-5 ml-1" />}
            </h1>
            <div className="flex items-center space-x-1 text-sm">
              <Star className="sq-3" />
              <p>{spot.rating._avg.rating ? spot.rating._avg.rating?.toFixed(1) : "Not rated"}</p>
              <p>·</p>
              <p>
                {spot._count.reviews} {spot._count.reviews === 1 ? "review" : "reviews"}
              </p>

              <p>·</p>
              <p>{spot.address}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" leftIcon={<Share className="sq-4" />} aria-label="share">
              Share
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" leftIcon={<Heart className="sq-4" />} aria-label="favourite">
                  Save
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end">
                <PopoverArrow />
                <div className="p-2">
                  <p className="font-medium">Favourite</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-xl font-medium">Description</h3>
            <ClientOnly>
              <p dangerouslySetInnerHTML={{ __html: spot.description }} />
            </ClientOnly>
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

        <hr />

        <div className="space-y-2">
          <div className="flex justify-between">
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
