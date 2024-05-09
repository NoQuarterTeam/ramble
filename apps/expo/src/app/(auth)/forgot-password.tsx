import { useRouter } from "expo-router"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"

import { Button } from "~/components/ui/Button"
import { FormInput } from "~/components/ui/FormInput"
import { ModalView } from "~/components/ui/ModalView"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

export default function Screen() {
  useKeyboardController()

  const navigation = useRouter()

  const form = useForm({ defaultValues: { email: "" } })

  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.auth.forgotPassword.useMutation({
    onSuccess: async () => {
      if (navigation.canGoBack()) {
        navigation.back()
      } else {
        navigation.push("/")
      }
      await new Promise((resolve) => setTimeout(resolve, 100))
      toast({ title: "Instructions sent to your email" })
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))

  return (
    <ModalView title="forgot password?" shouldRenderToast onBack={() => navigation.back()}>
      <FormProvider {...form}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <FormInput
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              name="email"
              label="Email"
              error={error}
            />
            <Button className="mb-1" isLoading={isLoading} disabled={isLoading} onPress={onSubmit}>
              Send instructions
            </Button>
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
