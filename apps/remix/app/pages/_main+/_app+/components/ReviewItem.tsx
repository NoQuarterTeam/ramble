import * as React from "react"
import { Link } from "@remix-run/react"
import dayjs from "dayjs"
import { Star } from "lucide-react"

import type { Prisma } from "@ramble/database/types"
import { createImageUrl, join } from "@ramble/shared"

import { useFetcher } from "~/components/Form"
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
import { useMaybeUser } from "~/lib/hooks/useMaybeUser"
import type { SerializeFrom } from "~/lib/vendor/vercel.server"
import { type TranslateReview } from "~/pages/api+/reviews+/$id.translate.$lang"

import { Actions } from "../spots.$id_.reviews.$reviewId"

export const reviewItemSelectFields = {
  id: true,
  spotId: true,
  description: true,
  rating: true,
  language: true,
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
  const [isTranslated, setIsTranslated] = React.useState(false)
  const translateFetcher = useFetcher<TranslateReview>()

  return (
    <div className="rounded-xs space-y-2 border px-4 py-3">
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
          <Star className="sq-5 fill-black dark:fill-white" />
          <p>{review.rating}</p>
        </div>
      </div>
      <p className={join(translateFetcher.state === "loading" && "animate-pulse-fast")}>
        {(isTranslated && user && translateFetcher.data) || review.description}
      </p>
      {user ? (
        user.id === review.user.id ? (
          <div className="flex space-x-2">
            <LinkButton size="sm" variant="outline" to={`reviews/${review.id}`}>
              Edit
            </LinkButton>
            <AlertDialogRoot>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
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

                  <deleteFetcher.Form action={`/spots/${review.spotId}/reviews/${review.id}`}>
                    <deleteFetcher.FormButton value={Actions.Delete}>Confirm</deleteFetcher.FormButton>
                  </deleteFetcher.Form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogRoot>
          </div>
        ) : (
          user.preferredLanguage !== review.language && (
            <Button
              onClick={() => {
                setIsTranslated(!isTranslated)
                translateFetcher.load(`/api/reviews/${review.id}/translate/${user.preferredLanguage}`)
              }}
              variant="link"
              size="sm"
              className="px-0"
            >
              {isTranslated ? "See original" : "See translation"}
            </Button>
          )
        )
      ) : null}
    </div>
  )
}
