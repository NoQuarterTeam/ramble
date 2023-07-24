import { Link, useFetcher } from "@remix-run/react"
import type { SerializeFrom } from "@vercel/remix"
import dayjs from "dayjs"
import { Star } from "lucide-react"

import type { Prisma } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { LinkButton } from "~/components/LinkButton"
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  Button,
} from "~/components/ui"
import { FormAction } from "~/lib/form"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

import { Actions } from "../spots.$id.reviews.$reviewId"

export const reviewItemSelectFields = {
  id: true,
  spotId: true,
  description: true,
  rating: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      avatar: true,
      firstName: true,
      lastName: true,
      username: true,
    },
  },
} satisfies Prisma.ReviewSelect

interface Props {
  review: SerializeFrom<Prisma.ReviewGetPayload<{ select: typeof reviewItemSelectFields }>>
}

export function ReviewItem({ review }: Props) {
  const user = useMaybeUser()
  const deleteFetcher = useFetcher()
  return (
    <div className="stack space-y-2 rounded-md border border-gray-100 px-4 py-3 dark:border-gray-700">
      <div className="flex justify-between">
        <div className="hstack">
          <Avatar size={40} className="sq-10 rounded-full" src={createImageUrl(review.user.avatar)} />
          <div>
            <Link to={`/${review.user.username}`} className="text-md hover:underline">
              {review.user.firstName} {review.user.lastName}
            </Link>
            <p className="text-sm leading-3 opacity-70">{dayjs(review.createdAt).format("DD/MM/YYYY")}</p>
          </div>
        </div>
        <div className="hstack">
          <Star className="sq-5" />
          <p>{review.rating}</p>
        </div>
      </div>
      <p className="text-sm">{review.description}</p>
      {user?.id === review.user.id && (
        <div className="flex space-x-2">
          <LinkButton variant="outline" to={`reviews/${review.id}`}>
            Edit
          </LinkButton>
          <AlertDialogRoot>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel asChild>
                  <Button variant="ghost">Cancel</Button>
                </AlertDialogCancel>

                <deleteFetcher.Form method="post" action={`/spots/${review.spotId}/reviews/${review.id}`} replace>
                  <FormAction value={Actions.Delete} />
                  <Button type="submit">Confirm</Button>
                </deleteFetcher.Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogRoot>
        </div>
      )}
    </div>
  )
}
