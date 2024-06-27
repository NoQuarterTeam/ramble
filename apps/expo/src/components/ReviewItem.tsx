import type { Review, User } from "@ramble/database/types"
import { createAssetUrl } from "@ramble/shared"
import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "expo-router"
import { Languages, Star, User2 } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"
import { api } from "~/lib/api"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"
import { type TranslateInput, getTranslation } from "~/lib/translation"
import { Icon } from "./Icon"
import { Button } from "./ui/Button"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

export function ReviewItem({
  review,
}: {
  review: Pick<Review, "id" | "createdAt" | "description" | "rating" | "spotId" | "language"> & {
    user: Pick<User, "id" | "avatar" | "firstName" | "lastName" | "username" | "avatarBlurHash">
  }
}) {
  const { me } = useMe()
  const router = useRouter()
  const utils = api.useUtils()
  const { mutate: deleteReview, isPending: deleteLoading } = api.review.delete.useMutation({
    onSuccess: () => {
      if (!review) return
      utils.spot.detail.refetch({ id: review.spotId })
      utils.spot.mapPreview.refetch({ id: review.spotId })
    },
  })

  const [isTranslated, setIsTranslated] = React.useState(false) // by default, leave review untranslated, until user actioned

  const { data, error, isLoading } = useQuery<TranslateInput, string, string>({
    queryKey: ["review-translation", { id: review.id, description: review.description, lang: me?.preferredLanguage || "en" }],
    queryFn: () => getTranslation({ text: review.description, lang: me?.preferredLanguage || "en" }),
    staleTime: Number.POSITIVE_INFINITY,
    enabled: isTranslated && !!me?.preferredLanguage && !!review.description,
  })

  const tab = useTabSegment()
  const isDark = useColorScheme() === "dark"
  return (
    <View className="space-y-2 rounded-xs border border-gray-200 p-4 dark:border-gray-700">
      <View className="flex flex-row justify-between">
        <TouchableOpacity
          onPress={() => router.push(`/${tab}/${review.user.username}/(profile)`)}
          activeOpacity={0.8}
          className="flex flex-row space-x-2"
        >
          {review.user.avatar ? (
            <OptimizedImage
              height={40}
              width={40}
              placeholder={review.user.avatarBlurHash}
              source={{ uri: createAssetUrl(review.user.avatar) }}
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
            <Text className="text-xs leading-4 opacity-70">{dayjs(review.createdAt).format("DD/MM/YYYY")}</Text>
          </View>
        </TouchableOpacity>

        <View className="flex flex-row items-center space-x-1">
          <Icon icon={Star} size={20} fill={isDark ? "white" : "black"} />
          <Text className="text-sm">{review.rating}</Text>
        </View>
      </View>

      {review.description && <Text>{(isTranslated && me && data) || review.description}</Text>}
      {error && <Text className="text-sm">Error translating description</Text>}

      {me ? (
        me.id !== review.user.id ? (
          <View className="flex flex-row space-x-1">
            <Button
              size="xs"
              className="w-[60px]"
              variant="secondary"
              onPress={() => router.push(`/${tab}/spot/${review.spotId}/reviews/${review.id}/`)}
            >
              Edit
            </Button>
            <Button
              className="w-[60px]"
              size="xs"
              isLoading={deleteLoading}
              variant="destructive"
              onPress={() => deleteReview({ id: review.id })}
            >
              Delete
            </Button>
          </View>
        ) : (
          me.preferredLanguage !== review.language && (
            <View className="flex items-start">
              <Button
                leftIcon={<Icon icon={Languages} size={14} />}
                onPress={() => setIsTranslated((t) => !t)}
                isLoading={isLoading}
                variant="link"
                size="xs"
                className="px-0 h-6"
              >
                {isTranslated ? "See original" : "Translate"}
              </Button>
            </View>
          )
        )
      ) : null}
    </View>
  )
}
