import { FormProvider, useForm } from "react-hook-form"
import { TouchableOpacity, useColorScheme, View } from "react-native"
import { Star } from "lucide-react-native"
import { type z } from "zod"

import { type reviewSchema } from "@ramble/api/src/schemas/review"
import { type Review } from "@ramble/database/types"

import { Button } from "../../../../../../components/Button"
import { FormError } from "../../../../../../components/FormError"
import { FormInput, FormInputError } from "../../../../../../components/FormInput"
import { ApiError } from "../../../../../../lib/hooks/useForm"

interface Props {
  spotId: string
  isLoading: boolean
  error?: ApiError
  review?: Pick<Review, "rating" | "description">
  onSubmit: (data: z.infer<typeof reviewSchema>) => void
}

export function ReviewForm(props: Props) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const form = useForm({
    defaultValues: { description: props.review?.description || "", spotId: props.spotId, rating: props.review?.rating || 0 },
  })
  const rating = form.watch("rating")
  return (
    <FormProvider {...form}>
      <FormInput
        className="mb-2 h-[100px]"
        name="description"
        placeholder="How was your stay? what did you like?"
        numberOfLines={4}
        multiline
        error={props.error}
      />

      <View className="mb-4 flex flex-row items-center justify-center space-x-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <TouchableOpacity key={i} onPress={() => form.setValue("rating", i + 1)}>
            <Star
              strokeWidth={1.5}
              size={50}
              className="text-black dark:text-white"
              fill={rating > i ? (isDark ? "white" : "black") : undefined}
            />
          </TouchableOpacity>
        ))}
      </View>
      {props.error?.data?.zodError?.fieldErrors.rating?.map((error) => (
        <FormInputError key={error} error={error} />
      ))}
      <FormError className="mb-1" error={props.error} />
      <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.onSubmit)}>
        Save
      </Button>
    </FormProvider>
  )
}
