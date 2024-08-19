import { useLocalSearchParams, useRouter } from "expo-router"
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
  const { token } = useLocalSearchParams<{ token: string }>()
  const navigation = useRouter()

  const form = useForm({ defaultValues: { password: "" } })

  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.auth.resetPassword.useMutation({
    onSuccess: async () => {
      navigation.navigate("/")
      navigation.navigate("/login")
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Password reset!" })
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate({ ...data, token }))

  return (
    <ModalView shouldRenderToast title="reset password" onBack={() => navigation.back()}>
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
              name="password"
              autoComplete="password"
              secureTextEntry
              label="Password"
              error={error}
            />
            <Button className="mb-1" isLoading={isLoading} disabled={isLoading} onPress={onSubmit}>
              Reset
            </Button>
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
