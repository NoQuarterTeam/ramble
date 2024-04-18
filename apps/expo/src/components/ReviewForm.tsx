import { Star } from "lucide-react-native"
import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import type { Review, Tag } from "@ramble/database/types"

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
  review: Pick<Review, "rating" | "description">
  tags: Tag[]
  onUpdate: (data: Omit<RouterInputs["review"]["update"], "id">) => void
}
type CreateSubmit = {
  review?: undefined
  tags?: undefined
  onCreate: (data: RouterInputs["review"]["create"]) => void
}

interface Props {
  spotId: string
  isLoading: boolean
  error?: ApiError
}

export function ReviewForm(props: Props & (UpdateSubmit | CreateSubmit)) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const { data: allTagsGrouped, isLoading: tagsLoading } = api.review.allTagsGrouped.useQuery()

  const [selectedTagIds, setSelectedTagIds] = React.useState<string[]>(props.tags?.map((tag) => tag.id) || [])

  const form = useForm({
    defaultValues: {
      description: props.review?.description || "",
      spotId: props.spotId,
      rating: props.review?.rating || 0,
      tagIds: props.tags?.map((tag) => tag.id) || [],
    },
  })
  const rating = form.watch("rating")

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      const onion = selectedTagIds.filter((existingTagId) => existingTagId !== tagId)
      setSelectedTagIds(onion)
    } else {
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  return (
    <FormProvider {...form}>
      {tagsLoading ? (
        <Spinner />
      ) : (
        allTagsGrouped &&
        Object.keys(allTagsGrouped).map((key) => (
          <View key={key}>
            <Text className="font-700">{key}</Text>
            <View className="flex flex-row flex-wrap gap-2 pb-2">
              {allTagsGrouped[key]?.map((tag) => (
                <Button
                  key={tag.id}
                  size="sm"
                  variant={selectedTagIds.includes(tag.id) ? "primary" : "outline"}
                  onPress={() => handleToggleTag(tag.id)}
                >
                  {tag.name}
                </Button>
              ))}
            </View>
          </View>
        ))
      )}
      <FormInput
        className="mb-2"
        name="description"
        label="Be nice, be honest"
        placeholder="How was your stay? what did you like?"
        numberOfLines={4}
        multiline
        error={props.error}
      />

      <View className="mb-4 flex flex-row items-center justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((val) => (
          <TouchableOpacity key={val} onPress={() => form.setValue("rating", val)}>
            <Icon
              icon={Star}
              strokeWidth={1}
              size={50}
              fill={rating >= val ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
      {props.error?.data?.zodError?.fieldErrors.rating?.map((error) => (
        <FormInputError key={error} error={error} />
      ))}
      <Button
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
