import { Form, useLoaderData } from "@remix-run/react"
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Edit2, Verified } from "lucide-react"

import { createImageUrl } from "@ramble/shared"
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from "@ramble/ui"

import { FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"
import { db } from "~/lib/db.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { notFound, redirect } from "~/lib/remix.server"
import { canManageSpot } from "~/lib/spots"
import { getCurrentUser } from "~/services/auth/auth.server"

import { ReviewItem } from "./components/ReviewItem"

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      verifiedAt: true,
      address: true,
      description: true,
      ownerId: true,
      images: { select: { id: true, path: true } },
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

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex gap-2 overflow-scroll">
        {spot.images.map((image) => (
          <img
            alt="spot"
            key={image.id}
            src={createImageUrl(image.path)}
            className="h-[200px] w-[300px] rounded-md object-cover"
            width={300}
            height={200}
          />
        ))}
      </div>
      <h1 className="text-4xl">
        <span>{spot.name}</span>
        {spot.verifiedAt && <Verified className="sq-5 ml-1" />}
      </h1>
      {canManageSpot(spot, user) && (
        <div className="flex space-x-2">
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

      <p className="text-xl">{spot.address}</p>
      <p dangerouslySetInnerHTML={{ __html: spot.description }} />

      <div className="space-y-2">
        <div className="flex justify-between">
          <p className="text-xl">Review</p>
          {user && (
            <LinkButton variant="secondary" to="reviews/new">
              Add review
            </LinkButton>
          )}
        </div>
        <div className="md: grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spot.reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      </div>
    </div>
  )
}
