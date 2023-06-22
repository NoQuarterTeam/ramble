import { FormProvider } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, TouchableOpacity } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Button } from "../../components/Button"
import { FormError } from "../../components/FormError"
import { FormInput } from "../../components/FormInput"
import { ModalView } from "../../components/ModalView"
import { Text } from "../../components/Text"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useRouter } from "../router"

export function RegisterScreen() {
  const queryClient = api.useContext()
  const navigation = useRouter()
  const { mutate, error, isLoading } = api.auth.register.useMutation({
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
  const form = useForm({
    defaultValues: { email: "", password: "", username: "", firstName: "", lastName: "" },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(data)
  })

  return (
    <ModalView title="Register">
      <KeyboardAvoidingView>
        <FormProvider {...form}>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <FormInput name="email" label="Email" error={error} />
            <FormInput name="password" secureTextEntry label="Password" error={error} />
            <FormInput name="username" label="Username" error={error} />
            <FormInput name="firstName" label="First name" error={error} />
            <FormInput name="lastName" label="Last name" error={error} />
            <Button className="mb-1" isLoading={isLoading} onPress={onSubmit}>
              Register
            </Button>
            <FormError className="mb-1" error={error} />
            <TouchableOpacity onPress={() => navigation.push("AuthLayout", { screen: "LoginScreen" })}>
              <Text className="text-lg">Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </ModalView>
  )
}
