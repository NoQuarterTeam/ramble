import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"

import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput } from "~/components/ui/FormInput"
import { ModalView } from "~/components/ui/ModalView"
import { Text } from "~/components/ui/Text"
import { AUTH_TOKEN, api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

export default function LoginScreen() {
  useKeyboardController()
  const utils = api.useUtils()
  const navigation = useRouter()

  const form = useForm({ defaultValues: { email: "", password: "" } })

  const { mutate, isLoading, error } = api.auth.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      utils.user.me.setData(undefined, data.user)
      if (navigation.canGoBack()) {
        navigation.back()
      } else {
        navigation.push("/")
      }
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(data)
  })

  return (
    <ModalView title="login" onBack={() => navigation.back()}>
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
            <FormInput
              autoCapitalize="none"
              name="password"
              autoComplete="password"
              secureTextEntry
              label="Password"
              error={error}
            />
            <Button className="mb-1" isLoading={isLoading} disabled={isLoading} onPress={onSubmit}>
              Login
            </Button>
            <FormError className="mb-1" error={error} />
          </View>
          <View className="flex flex-row items-center justify-center">
            <Text className="text-base">No account yet?</Text>
            <Button className="px-1" variant="link" onPress={() => navigation.replace("/register")}>
              Register
            </Button>
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
