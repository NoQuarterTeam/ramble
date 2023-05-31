import { FormProvider } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Link, useNavigation, useRouter } from "expo-router"

import { Button } from "../../components/Button"
import { FormError } from "../../components/FormError"
import { FormInput } from "../../components/FormInput"
import { ModalView } from "../../components/ModalView"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"

export default function Login() {
  const queryClient = api.useContext()
  const router = useRouter()

  const form = useForm({ defaultValues: { email: "jack@noquarter.co", password: "password" } })
  const navigation = useNavigation()
  const { mutate, isLoading, error } = api.auth.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.auth.me.setData(undefined, data.user)
      if (navigation.canGoBack()) {
        router.back()
      } else {
        router.replace("/profile")
      }
    },
  })

  const handleLogin = async (data: unknown) => {
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(data)
  }

  return (
    <ModalView title="Login">
      <KeyboardAvoidingView>
        <FormProvider {...form}>
          <ScrollView className="h-full">
            <FormInput autoCapitalize="none" name="email" label="Email" error={error?.data?.zodError?.fieldErrors.email} />
            <FormInput
              autoCapitalize="none"
              name="password"
              secureTextEntry
              label="Password"
              error={error?.data?.zodError?.fieldErrors.password}
            />
            <Button className="mb-1" isLoading={isLoading} disabled={isLoading} onPress={form.handleSubmit(handleLogin)}>
              Login
            </Button>
            {error?.data?.formError && <FormError className="mb-1" error={error.data.formError} />}
            <Link href="/register" className="text-lg">
              Register
            </Link>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </ModalView>
  )
}
