import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Button } from "../../components/ui/Button"
import { FormError } from "../../components/ui/FormError"
import { FormInput } from "../../components/ui/FormInput"
import { ModalView } from "../../components/ui/ModalView"
import { Text } from "../../components/ui/Text"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useKeyboardController } from "../../lib/hooks/useKeyboardController"
import { useRouter } from "../router"

export function LoginScreen() {
  useKeyboardController()
  const queryClient = api.useUtils()
  const navigation = useRouter()

  const form = useForm({ defaultValues: { email: "", password: "" } })

  const { mutate, isLoading, error } = api.auth.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.user.me.setData(undefined, data.user)
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.push("AppLayout")
      }
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(data)
  })

  return (
    <ModalView title="login" onBack={() => navigation.navigate("AppLayout")}>
      <FormProvider {...form}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <FormInput autoCapitalize="none" autoComplete="email" name="email" label="Email" error={error} />
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
            <Button className="px-1" variant="link" onPress={() => navigation.replace("RegisterScreen")}>
              Register
            </Button>
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
