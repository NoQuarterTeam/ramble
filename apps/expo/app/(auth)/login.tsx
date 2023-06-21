import { FormProvider } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { type z } from "zod"

import { loginSchema } from "@ramble/api/src/schemas/user"

import { Button } from "../../components/Button"
import { FormError } from "../../components/FormError"
import { FormInput } from "../../components/FormInput"
import { ModalView } from "../../components/ModalView"
import { Text } from "../../components/Text"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useRouter } from "../router"

export function LoginScreen() {
  const queryClient = api.useContext()
  const navigation = useRouter()

  const form = useForm({ defaultValues: { email: "jack@noquarter.co", password: "password" }, schema: loginSchema })

  const { mutate, isLoading, error } = api.auth.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.auth.me.setData(undefined, data.user)
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.push("AppLayout")
      }
    },
  })

  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(data)
  }

  return (
    <ModalView title="Login">
      <KeyboardAvoidingView>
        <FormProvider {...form}>
          <ScrollView className="h-full">
            <FormInput autoCapitalize="none" name="email" label="Email" error={error} />
            <FormInput autoCapitalize="none" name="password" secureTextEntry label="Password" error={error} />
            <Button className="mb-1" isLoading={isLoading} disabled={isLoading} onPress={form.handleSubmit(handleLogin)}>
              Login
            </Button>
            <FormError className="mb-1" error={error} />
            <TouchableOpacity onPress={() => navigation.push("AuthLayout", { screen: "RegisterScreen" })}>
              <Text className="text-lg">Register</Text>
            </TouchableOpacity>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </ModalView>
  )
}
