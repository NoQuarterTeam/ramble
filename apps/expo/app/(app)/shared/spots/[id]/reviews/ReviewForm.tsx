import { FormProvider, useForm } from "react-hook-form"
import { FormInput, FormInputError } from "../../../../../../components/FormInput"
import { Star } from "lucide-react-native"
import { View, TouchableOpacity, useColorScheme } from "react-native"
import { FormError } from "../../../../../../components/FormError"
import { Button } from "../../../../../../components/Button"
import { z } from "zod"
import { reviewSchema } from "@ramble/api/src/schemas/review"
import { Review } from "@ramble/database/types"
import { TRPCClientErrorLike } from "@trpc/client"

interface Props {
  spotId: string
  isLoading: boolean
  error?: TRPCClientErrorLike<{
    code: number
    message: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { zodError?: { fieldErrors: any } | null; formError?: string | null }
  }> | null
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
        error={props.error?.data?.zodError?.fieldErrors.description}
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
      {props.error?.data?.zodError?.fieldErrors.rating?.map((error: string) => (
        <FormInputError key={error} error={error} />
      ))}

      <Button isLoading={props.isLoading} onPress={form.handleSubmit(props.onSubmit)}>
        Save
      </Button>
      <FormError className="mt-1" />
    </FormProvider>
  )
}
