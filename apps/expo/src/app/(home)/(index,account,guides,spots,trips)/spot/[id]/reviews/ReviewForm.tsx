import { Star } from "lucide-react-native"
import { FormProvider, useForm } from "react-hook-form"
import { TouchableOpacity, View, useColorScheme } from "react-native"

import type { Review } from "@ramble/database/types"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput, FormInputError } from "~/components/ui/FormInput"
import type { RouterInputs } from "~/lib/api"
import type { ApiError } from "~/lib/hooks/useForm"
import { backgroundDark, backgroundLight } from "~/lib/tailwind"

type UpdateSubmit = {
  review: Pick<Review, "rating" | "description">
  onUpdate: (data: Omit<RouterInputs["review"]["update"], "id">) => void
}
type CreateSubmit = {
  review?: undefined
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
  const form = useForm({
    defaultValues: { description: props.review?.description || "", spotId: props.spotId, rating: props.review?.rating || 0 },
  })
  const rating = form.watch("rating")
  return (
    <FormProvider {...form}>
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
      <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.review ? props.onUpdate : props.onCreate)}>
        Save
      </Button>
      <FormError className="mb-1" error={props.error} />
    </FormProvider>
  )
}
