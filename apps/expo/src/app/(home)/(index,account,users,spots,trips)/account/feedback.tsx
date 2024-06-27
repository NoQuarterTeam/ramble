import { useRouter } from "expo-router"
import { Bug, Lightbulb, MessageCircle } from "lucide-react-native"
import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native"

import type { FeedbackType } from "@ramble/database/types"
import { join } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInput } from "~/components/ui/FormInput"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

const feedbackTypes = [
  { label: "Issue", value: "ISSUE", icon: Bug },
  { label: "Idea", value: "IDEA", icon: Lightbulb },
  { label: "Other", value: "OTHER", icon: MessageCircle },
]

export default function AccountFeedbackScreen() {
  useKeyboardController()

  const [type, setType] = React.useState<FeedbackType | null>(null)
  const router = useRouter()
  const form = useForm({
    defaultValues: { message: "" },
  })

  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.feedback.create.useMutation({
    onSuccess: async () => {
      router.back()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Feedback sent! Thank you!" })
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    if (!type) return toast({ title: "Please select a feedback type" })
    Keyboard.dismiss()
    mutate({ ...data, type })
  })

  const isDirty = form.formState.isDirty
  return (
    <FormProvider {...form}>
      <ScreenView
        title="feedback"
        rightElement={
          isDirty && !!type ? (
            <Button isLoading={isLoading} variant="link" size="sm" onPress={onSubmit}>
              Send
            </Button>
          ) : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-row items-center justify-between gap-2">
            {feedbackTypes.map((feedbackType) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setType(feedbackType.value as FeedbackType)}
                key={feedbackType.value}
                className={join(
                  "flex flex-grow items-center space-y-2 rounded-xs border border-gray-200 p-4 dark:border-gray-700",
                  type === feedbackType.value && "border-primary",
                )}
              >
                <Icon icon={feedbackType.icon} size={24} />
                <Text>{feedbackType.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormInput multiline name="message" label="Message" error={error} />
        </ScrollView>
      </ScreenView>
    </FormProvider>
  )
}
