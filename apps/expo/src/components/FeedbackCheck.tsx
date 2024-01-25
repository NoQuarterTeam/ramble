import { FormProvider } from "react-hook-form"
import { Keyboard, Modal, ScrollView, TouchableOpacity, useColorScheme, View } from "react-native"
import dayjs from "dayjs"
import { StatusBar } from "expo-status-bar"
import { CheckSquare2, Square, Star } from "lucide-react-native"

import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useMe } from "~/lib/hooks/useMe"
import { backgroundDark, backgroundLight } from "~/lib/tailwind"

import { Icon } from "./Icon"
import { BrandHeading } from "./ui/BrandHeading"
import { Button } from "./ui/Button"
import { FormInput, FormInputLabel } from "./ui/FormInput"
import { Text } from "./ui/Text"
import { Toast, toast } from "./ui/Toast"

export function FeedbackCheck() {
  useKeyboardController()

  const { me, isLoading } = useMe()
  const { data: hasSubmittedFeedback, isLoading: feedbackLoading } = api.user.hasSubmittedFeedback.useQuery(undefined, {
    enabled: !!me && dayjs(me.createdAt).isBefore(dayjs().subtract(1, "week")),
  })

  const theme = useColorScheme()
  const isDark = theme === "dark"
  const utils = api.useUtils()
  const form = useForm({
    defaultValues: { rating: 0, needs: [] as string[], shareable: 0, other: "" },
  })
  const { mutate, isLoading: createLoading } = api.feedback.create.useMutation({
    onSuccess: async () => {
      await utils.user.hasSubmittedFeedback.refetch()
      await new Promise((r) => setTimeout(r, 1000))
      toast({ title: "Thank you so much for the feedback!" })
    },
  })

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!values.rating) return toast({ title: "Please select a rating" })
    if (!values.shareable) return toast({ title: "How likely are you to share ramble?" })
    Keyboard.dismiss()
    const other = values.other ? `, other - ${values.other}` : ""
    const content = `rating - ${values.rating}/5, wants - ${values.needs.join(", ")}, shareable - ${values.shareable}/5${other}`
    return mutate({ message: content, type: "OTHER" })
  })

  const rating = form.watch("rating")
  const shareable = form.watch("shareable")
  const needs = form.watch("needs")

  if (isLoading || feedbackLoading || hasSubmittedFeedback) return null
  return (
    <Modal animationType="slide" presentationStyle="formSheet" visible>
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
          className="bg-background dark:bg-background-dark flex-1 flex-grow px-4 pt-4"
        >
          <FormProvider {...form}>
            <View className="space-y-2">
              <View>
                <BrandHeading className="w-11/12 pb-2 text-2xl">we'd love your feedback</BrandHeading>
                <Text>
                  Hey {me?.firstName}, thanks for using the beta, we hope you're enjoying Ramble. We'd love to hear your feedback
                  so we can make it even better!
                </Text>
              </View>
              <View>
                <FormInputLabel label="1. How are you enjoying the app so far?" />
                <View className="my-4 flex flex-row items-center justify-center space-x-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => form.setValue("rating", i + 1)}>
                      <Icon
                        icon={Star}
                        strokeWidth={1}
                        size={40}
                        fill={rating > i ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <FormInputLabel label="2. What could we improve?" />
                <View className="my-2 space-y-2">
                  {[
                    "More spots",
                    "More social/community features",
                    "More spot categories (cafe's etc)",
                    "More smart trip planning features",
                    "More integrations (weather etc)",
                  ].map((need) => {
                    const isSelected = needs.includes(need)
                    return (
                      <TouchableOpacity
                        key={need}
                        className="flex flex-row items-center space-x-2 py-0.5"
                        onPress={() => form.setValue("needs", isSelected ? needs.filter((n) => n !== need) : [...needs, need])}
                      >
                        <Icon icon={isSelected ? CheckSquare2 : Square} />
                        <Text>{need}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
              <View>
                <FormInputLabel label="3. How likely are you to share Ramble with a friend?" />
                <View className="my-4 flex flex-row items-center justify-center space-x-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => form.setValue("shareable", i + 1)}>
                      <Icon
                        icon={Star}
                        strokeWidth={1}
                        size={40}
                        fill={shareable > i ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <FormInput
                label="4. Anything else you wana mention? e.g. other features you would like to see"
                name="other"
                multiline
              />
              <Button isLoading={createLoading} disabled={createLoading} onPress={handleSubmit}>
                Send feedback
              </Button>
            </View>
          </FormProvider>
        </ScrollView>
        <StatusBar style="light" />
        <Toast />
      </View>
    </Modal>
  )
}
