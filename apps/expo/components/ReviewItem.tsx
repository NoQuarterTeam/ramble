import { TouchableOpacity, View } from "react-native"
import dayjs from "dayjs"
import { Star, User2 } from "lucide-react-native"

import { type Review, type User } from "@ramble/database/types"
import { createImageUrl } from "@ramble/shared"

import { useRouter } from "../app/router"
import { api } from "../lib/api"
import { useMe } from "../lib/hooks/useMe"
import { Button } from "./ui/Button"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"
import { Icon } from "./Icon"

export function ReviewItem({
  review,
}: {
  review: Pick<Review, "id" | "createdAt" | "description" | "rating" | "spotId"> & {
    user: Pick<User, "id" | "avatar" | "firstName" | "lastName" | "username" | "avatarBlurHash">
  }
}) {
  const { me } = useMe()
  const { push } = useRouter()
  const utils = api.useUtils()
  const { mutate: deleteReview, isLoading: deleteLoading } = api.review.delete.useMutation({
    onSuccess: () => {
      if (!review) return
      utils.spot.detail.refetch({ id: review.spotId })
      utils.spot.mapPreview.refetch({ id: review.spotId })
    },
  })
  return (
    <View className="rounded-xs space-y-2 border border-gray-200 p-4 dark:border-gray-700">
      <View className="flex flex-row justify-between">
        <TouchableOpacity
          onPress={() => push("UserScreen", { username: review.user.username })}
          activeOpacity={0.8}
          className="flex flex-row space-x-2"
        >
          {review.user.avatar ? (
            <OptimizedImage
              height={40}
              width={40}
              placeholder={review.user.avatarBlurHash}
              source={{ uri: createImageUrl(review.user.avatar) }}
              className="sq-10 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
            />
          ) : (
            <View className="sq-10 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
              <Icon icon={User2} />
            </View>
          )}

          <View>
            <Text>
              {review.user.firstName} {review.user.lastName}
            </Text>
            <Text className="text-sm   opacity-70">{dayjs(review.createdAt).format("DD/MM/YYYY")}</Text>
          </View>
        </TouchableOpacity>

        <View className="flex flex-row items-center space-x-1">
          <Icon icon={Star} size={20} />
          <Text className="text-sm">{review.rating}</Text>
        </View>
      </View>

      <Text>{review.description}</Text>

      {me?.id === review.user.id && (
        <View className="flex flex-row space-x-1">
          <Button size="sm" variant="secondary" onPress={() => push("ReviewDetailScreen", { id: review.id })}>
            Edit
          </Button>
          <Button size="sm" isLoading={deleteLoading} variant="destructive" onPress={() => deleteReview({ id: review.id })}>
            Delete
          </Button>
        </View>
      )}
    </View>
  )
}
