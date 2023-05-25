import { Link, useFetcher } from "@remix-run/react"
import type { SerializeFrom } from "@vercel/remix"
import { Star } from "lucide-react"

import type { Prisma } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { Avatar, Button } from "@ramble/ui"

import { LinkButton } from "~/components/LinkButton"
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
          <Avatar
            className="sq-10 rounded-full"
            name={`${review.user.firstName} ${review.user.lastName}`}
            src={createImageUrl(review.user.avatar)}
          />
          <div>
            <Link to={`/${review.user.username}`} className="text-md hover:underline">
              {review.user.firstName} {review.user.lastName}
            </Link>
            <p className="text-sm leading-3 opacity-70">{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="hstack">
          <Star className="sq-5" />
          <p>{review.rating}</p>
        </div>
      </div>
      <p className="text-sm">{review.description}</p>
      <div className="flex space-x-2">
        {user?.id === review.user.id && (
          <LinkButton variant="outline" to={`reviews/${review.id}`}>
            Edit
          </LinkButton>
        )}
        <deleteFetcher.Form method="post" action={`/spots/${review.spotId}/reviews/${review.id}`} replace>
          <FormAction value={Actions.Delete} />
          <Button type="submit" variant="destructive">
            Delete
          </Button>
        </deleteFetcher.Form>
      </div>
    </div>
  )
}
