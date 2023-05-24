import { useFetcher } from "@remix-run/react"
import type { SerializeFrom } from "@vercel/remix"
import { Star } from "lucide-react"

import type { Review, User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"
import { Avatar, Button } from "@ramble/ui"

import { LinkButton } from "~/components/LinkButton"
import { FormAction } from "~/lib/form"
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"

import { Actions } from "../spots.$id.reviews.$reviewId"

interface Props {
  review: SerializeFrom<
    Pick<Review, "id" | "spotId" | "description" | "createdAt" | "rating"> & {
      user: Pick<User, "id" | "avatar" | "firstName" | "lastName">
    }
  >
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
            <p className="text-md">
              {review.user.firstName} {review.user.lastName}
            </p>
            <p className="text-sm opacity-70">{new Date(review.createdAt).toLocaleDateString()}</p>
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
