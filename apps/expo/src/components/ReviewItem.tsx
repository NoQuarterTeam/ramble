import { useQuery } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useRouter } from "expo-router"
import { Star, User2 } from "lucide-react-native"
import * as React from "react"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import type { Review, User } from "@ramble/database/types"
import { createAssetUrl } from "@ramble/shared"

import { api } from "~/lib/api"
import { FULL_WEB_URL } from "~/lib/config"
import { useMe } from "~/lib/hooks/useMe"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { Icon } from "./Icon"
import { Button } from "./ui/Button"
import { OptimizedImage } from "./ui/OptimisedImage"
import { Text } from "./ui/Text"

type TranslateInput = { id: string; lang: string }
async function getTranslation({ id, lang }: TranslateInput) {
  try {
    const res = await fetch(`${FULL_WEB_URL}/api/reviews/${id}/translate/${lang}`)
    return await res.json()
  } catch {
    return "Error translating description"
  }
}

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
  const { mutate: deleteReview, isLoading: deleteLoading } = api.review.delete.useMutation({
    onSuccess: () => {
      if (!review) return
      utils.spot.detail.refetch({ id: review.spotId })
      utils.spot.mapPreview.refetch({ id: review.spotId })
    },
  })

  const [isTranslated, setIsTranslated] = React.useState(false)

  const { data, error, isInitialLoading } = useQuery<TranslateInput, string, string>({
    queryKey: ["review-translation", { id: review.id, lang: me?.preferredLanguage || "en" }],
    queryFn: () => getTranslation({ id: review.id, lang: me?.preferredLanguage || "en" }),
    cacheTime: Number.POSITIVE_INFINITY,
    enabled: isTranslated && !!me && !!me?.preferredLanguage,
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
        me.id === review.user.id ? (
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
                onPress={() => setIsTranslated((t) => !t)}
                isLoading={isInitialLoading}
                variant="ghost"
                size="xs"
                className="px-0 h-4"
              >
                {isTranslated ? "See original" : "See translation"}
              </Button>
            </View>
          )
        )
      ) : null}
    </View>
  )
}
