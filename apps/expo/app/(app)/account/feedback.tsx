import { type FeedbackType } from "@ramble/database/types"
import { Bug, Lightbulb, MessageCircle } from "lucide-react-native"
import * as React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Icon } from "../../../components/Icon"
import { Button } from "../../../components/ui/Button"
import { FormError } from "../../../components/ui/FormError"
import { FormInput } from "../../../components/ui/FormInput"
import { ScreenView } from "../../../components/ui/ScreenView"
import { Text } from "../../../components/ui/Text"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useKeyboardController } from "../../../lib/hooks/useKeyboardController"
import { useRouter } from "../../router"
import { join } from "@ramble/shared"

const feedbackTypes = [
  { label: "Issue", value: "ISSUE", icon: Bug },
  { label: "Idea", value: "IDEA", icon: Lightbulb },
  { label: "Other", value: "OTHER", icon: MessageCircle },
]

export function AccountFeedbackScreen() {
  useKeyboardController()

  const [type, setType] = React.useState<FeedbackType | null>(null)
  const router = useRouter()
  const form = useForm({
    defaultValues: { message: "" },
  })

  const { mutate, isLoading, error } = api.feedback.create.useMutation({
    onSuccess: () => {
      router.goBack()
      toast({ title: "Feedback sent! Thank you!" })
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    if (!type) return toast({ title: "Please select a feedback type" })
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex flex-row items-center justify-between gap-2">
            {feedbackTypes.map((feedbackType) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setType(feedbackType.value as FeedbackType)}
                key={feedbackType.value}
                className={join(
                  "rounded-xs flex flex-grow items-center space-y-2 border border-gray-200 p-4 dark:border-gray-700",
                  type === feedbackType.value && "border-primary",
                )}
              >
                <Icon icon={feedbackType.icon} size={24} />
                <Text>{feedbackType.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FormInput multiline name="message" label="Message" error={error} />

          <FormError error={error} />
        </ScrollView>
      </ScreenView>
    </FormProvider>
  )
}
