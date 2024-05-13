import AsyncStorage from "@react-native-async-storage/async-storage"
import { StatusBar } from "expo-status-bar"
import { CheckSquare2, Square, Star } from "lucide-react-native"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { Keyboard, Modal, ScrollView, TouchableOpacity, View, useColorScheme } from "react-native"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"

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

const FEEDBACK_ACTIVITY_THRESHOLD = 50

export const useFeedbackActivity = create<{
  count: number
  isComplete: boolean
  increment: () => void
  complete: () => void
}>()(
  persist(
    (set) => ({
      count: 0,
      isComplete: false,
      increment: () => set((state) => ({ count: state.count + (state.isComplete ? 0 : 1) })),
      complete: () => set({ isComplete: true }),
    }),
    { name: "ramble.feedback.activity", storage: createJSONStorage(() => AsyncStorage) },
  ),
)

export const FeedbackCheck = React.memo(function _FeedbackCheck() {
  useKeyboardController()
  const { count, complete, isComplete } = useFeedbackActivity(
    useShallow((s) => ({
      count: s.count,
      complete: s.complete,
      isComplete: s.isComplete,
    })),
  )
  const { me } = useMe()

  const theme = useColorScheme()
  const isDark = theme === "dark"
  const form = useForm({
    defaultValues: { rating: 0, needs: [] as string[], shareable: 0, other: "" },
  })
  const { mutate, isPending: createLoading } = api.feedback.create.useMutation({
    onSuccess: async () => {
      complete()
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

  if (isComplete || count < FEEDBACK_ACTIVITY_THRESHOLD) return null
  return (
    <Modal animationType="slide" presentationStyle="formSheet" visible>
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
          showsVerticalScrollIndicator={false}
          className="flex-1 flex-grow bg-background px-4 pt-4 dark:bg-background-dark"
        >
          <FormProvider {...form}>
            <View className="space-y-2">
              <View>
                <BrandHeading className="w-11/12 pb-2 text-2xl">we'd love your feedback</BrandHeading>
                <Text>
                  Hey {me?.firstName || "there"}, thanks for using the beta, we hope you're enjoying Ramble. We'd love to hear
                  your feedback so we can make it even better!
                </Text>
              </View>
              <View>
                <FormInputLabel label="1. How are you enjoying the app so far?" />
                <View className="my-4 flex flex-row items-center justify-center space-x-6">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <TouchableOpacity key={val} onPress={() => form.setValue("rating", val)}>
                      <Icon
                        icon={Star}
                        strokeWidth={1}
                        size={40}
                        fill={rating >= val ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View>
                <FormInputLabel label="2. What could we improve/add to Ramble?" />
                <View className="my-2 space-y-2">
                  {[
                    "Job board",
                    "Trip planner/diary",
                    "Shared accounts with other users",
                    "More nature information (local species etc)",
                    "More social/community features",
                    "More spots",
                    "More map layers (mobile network coverage etc)",
                    "More spot categories (cafe's etc)",
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
                  {[1, 2, 3, 4, 5].map((val) => (
                    <TouchableOpacity key={val} onPress={() => form.setValue("shareable", val)}>
                      <Icon
                        icon={Star}
                        strokeWidth={1}
                        size={40}
                        fill={shareable >= val ? (isDark ? backgroundLight : backgroundDark) : "transparent"}
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
})
