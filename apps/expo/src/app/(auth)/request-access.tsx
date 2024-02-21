import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"

import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput } from "~/components/ui/FormInput"
import { ModalView } from "~/components/ui/ModalView"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

export default function RequestAccessScreen() {
  useKeyboardController()
  const navigation = useRouter()
  const posthog = usePostHog()
  const { mutate, error, isLoading } = api.auth.requestAccess.useMutation({
    onSuccess: async () => {
      posthog?.capture("user requested access")
      if (navigation.canGoBack()) {
        navigation.back()
      } else {
        navigation.push("/")
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Thanks! We will get in contact soon!" })
    },
  })
  const form = useForm({ defaultValues: { email: "" } })

  const onSubmit = form.handleSubmit((data) => mutate(data))

  return (
    <ModalView shouldRenderToast title="request access" onBack={() => navigation.back()}>
      <FormProvider {...form}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <FormInput autoCapitalize="none" name="email" label="Email" error={error} />

            <Button className="mb-1" isLoading={isLoading} onPress={onSubmit}>
              Request access
            </Button>

            <FormError className="mb-1" error={error} />
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
