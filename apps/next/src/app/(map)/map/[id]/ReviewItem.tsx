import dayjs from "dayjs"
import { Star } from "lucide-react"

import type { Prisma } from "@ramble/database/types"
import { createAssetUrl } from "@ramble/shared"

import { Avatar } from "@/components/ui"

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
  review: Prisma.ReviewGetPayload<{ select: typeof reviewItemSelectFields }>
}

export function ReviewItem({ review }: Props) {
  return (
    <div className="space-y-2 rounded-xs border px-4 py-3">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Avatar size={40} className="w-10 h-10 rounded-full" src={createAssetUrl(review.user.avatar)} />
          <div>
            <p className="text-md">
              {review.user.firstName} {review.user.lastName}
            </p>
            <p className="text-sm leading-3 opacity-70">{dayjs(review.createdAt).format("DD/MM/YYYY")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Star className="sq-5 fill-black dark:fill-white" />
          <p>{review.rating}</p>
        </div>
      </div>
      <p className="blur-sm">{review.description}</p>
    </div>
  )
}
