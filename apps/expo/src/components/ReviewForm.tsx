import { Heart, Leaf, Star, Users } from "lucide-react-native"
import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import type { Review, SpotType, Tag } from "@ramble/database/types"

import { isCampingSpot } from "@ramble/shared"
import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput, FormInputError } from "~/components/ui/FormInput"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { type RouterInputs, api } from "~/lib/api"
import type { ApiError } from "~/lib/hooks/useForm"
import { backgroundDark, backgroundLight } from "~/lib/tailwind"

type UpdateSubmit = {
  review: Pick<Review, "rating" | "description"> & { tags: Pick<Tag, "id" | "name" | "category">[] }
  onUpdate: (data: Omit<RouterInputs["review"]["update"], "id">) => void
}
type CreateSubmit = {
  review?: undefined
  onCreate: (data: RouterInputs["review"]["create"]) => void
}

interface Props {
  spotId: string
  spotType: SpotType
  isLoading: boolean
  error?: ApiError
}

export function ReviewForm(props: Props & (UpdateSubmit | CreateSubmit)) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"

  const { data: groupedTags, isLoading: tagsLoading } = api.review.groupedTags.useQuery(undefined, {
    enabled: isCampingSpot(props.spotType),
  })

  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(props.review?.tags.map((tag) => tag.id) || [])

  const form = useForm({
    defaultValues: {
      description: props.review?.description || "",
      spotId: props.spotId,
      rating: props.review?.rating || 0,
      tagIds: props.review?.tags.map((tag) => tag.id) || [],
    },
  })
  const rating = form.watch("rating")

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      const newTags = selectedTagIds.filter((existingTagId) => existingTagId !== tagId)
      setSelectedTagIds(newTags)
    } else {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  return (
    <FormProvider {...form}>
      {isCampingSpot(props.spotType) && (
        // <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <View>
          <View className="relative flex items-center justify-center mt-4 mb-2">
            <View className="absolute h-px w-full bg-gray-200 dark:bg-gray-700" />
            <View className="bg-background px-2 dark:bg-background-dark">
              <Text className="text-center text-xs opacity-70 font-600">TAGS</Text>
            </View>
          </View>
          {tagsLoading ? (
            <Spinner />
          ) : !groupedTags ? null : (
            Object.entries(groupedTags).map(([category, tags]) => (
              <View key={category} className="pb-4">
                <View className="flex flex-row gap-1 items-center pb-2">
                  {category === "NATURE" ? (
                    <Icon icon={Leaf} size={15} />
                  ) : category === "PEOPLE" ? (
                    <Icon icon={Users} size={15} />
                  ) : (
                    category === "SELF" && <Icon icon={Heart} size={15} />
                  )}
                  <Text className="font-600">{category}</Text>
                </View>
                <View className="flex flex-row flex-wrap gap-2 pb-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag.id}
                      size="xs"
                      variant={selectedTagIds.includes(tag.id) ? "primary" : "outline"}
                      onPress={() => handleToggleTag(tag.id)}
                    >
                      {tag.name.toLocaleUpperCase()}
                    </Button>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      )}
      <View className="relative flex items-center justify-center mt-4 mb-2">
        <View className="absolute h-px w-full bg-gray-200 dark:bg-gray-700" />
        <View className="bg-background px-2 dark:bg-background-dark">
          <Text className="text-center text-xs opacity-70 font-600">ADDITIONAL NOTES</Text>
        </View>
      </View>
      <FormInput
        className="mb-2"
        name="description"
        placeholder="Anything else you want to share?"
        numberOfLines={4}
        multiline
        error={props.error}
      />

      <View className="relative flex items-center justify-center mt-4 mb-2">
        <View className="absolute h-px w-full bg-gray-200 dark:bg-gray-700" />
        <View className="bg-background px-2 dark:bg-background-dark">
          <Text className="text-center text-xs opacity-70 font-600">OVERALL EXPERIENCE</Text>
        </View>
      </View>
      <View className="mb-4 flex flex-row items-center justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <TouchableOpacity key={val} onPress={() => form.setValue("rating", val)}>
            <Icon
              icon={Star}
              strokeWidth={1}
              size={30}
              fill={rating >= val ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
      {props.error?.data?.zodError?.fieldErrors.rating?.map((error) => (
        <FormInputError key={error} error={error} />
      ))}
      <Button
        className="mt-8"
        isLoading={props.isLoading}
        onPress={form.handleSubmit((data) =>
          props.review
            ? props.onUpdate({ ...data, tagIds: selectedTagIds })
            : props.onCreate({ ...data, tagIds: selectedTagIds }),
        )}
      >
        Save
      </Button>
      <FormError className="mb-1" error={props.error} />
    </FormProvider>
  )
}
