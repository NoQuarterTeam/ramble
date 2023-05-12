import { Form, useLoaderData } from "@remix-run/react"
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
import type { ActionArgs, LoaderArgs } from "@vercel/remix"
import { json } from "@vercel/remix"
import { Edit2, Verified } from "lucide-react"
import { cacheHeader } from "pretty-cache-header"
import { FormButton } from "~/components/Form"
import { LinkButton } from "~/components/LinkButton"

import { db } from "~/lib/db.server"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import { redirect } from "~/lib/remix.server"
import { canManageSpot } from "~/lib/spots"
import { getCurrentUser } from "~/services/auth/auth.server"
import { FlashType } from "~/services/session/flash.server"

export const loader = async ({ params }: LoaderArgs) => {
  const spot = await db.spot.findUniqueOrThrow({
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
          rating: true,
          description: true,
          user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        },
      },
    },
  })

  const rating = await db.review.aggregate({ where: { spotId: params.id }, _avg: { rating: true } })

  return json(
    { ...spot, rating },
    {
      headers: {
        "Cache-Control": cacheHeader({
          public: true,
          maxAge: "1hour",
          sMaxage: "1hour",
          staleWhileRevalidate: "1day",
          staleIfError: "1day",
        }),
      },
    },
  )
}

export const action = async ({ request, params }: ActionArgs) => {
  const user = await getCurrentUser(request, { id: true, role: true })
  const spot = await db.spot.findUniqueOrThrow({ where: { id: params.id }, select: { ownerId: true } })
  if (!canManageSpot(spot, user)) return redirect("/latest")
  await db.spot.delete({ where: { id: params.id } })
  return redirect("/latest", request, { flash: { type: FlashType.Info, title: "Spot deleted!" } })
}

export default function SpotDetail() {
  const spot = useLoaderData<typeof loader>()
  const user = useMaybeUser()

  return (
    <div className="p-4 md:p-8">
      <div>
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

        <p className="text-2xl">{spot.address}</p>
        <p>{spot.description}</p>
        <div className="flex flex-wrap gap-2">
          {spot.images.map((image) => (
            <img
              alt="spot"
              key={image.id}
              src={createImageUrl(image.path)}
              className="h-[200px] w-[300px] object-cover"
              width={300}
              height={200}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
