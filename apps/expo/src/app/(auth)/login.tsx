import { FormProvider } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Link, useRouter } from "expo-router"
import { type z } from "zod"

import { loginSchema } from "@travel/api/src/router/auth"

import { Button } from "../../components/Button"
import { FormError } from "../../components/FormError"
import { FormInput } from "../../components/FormInput"
import { Heading } from "../../components/Heading"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"

export default function Login() {
  const queryClient = api.useContext()
  const router = useRouter()

  const form = useForm({ defaultValues: { email: "", password: "" }, schema: loginSchema })

  const login = api.auth.login.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.auth.me.setData(undefined, data.user)
      router.replace("/")
    },
  })
  const handleLogin = async (data: z.infer<typeof loginSchema>) => {
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    login.mutate(data)
  }

  return (
    <KeyboardAvoidingView>
      a
      <FormProvider {...form}>
        <ScrollView className="h-full space-y-3 px-4 pt-16">
          <Heading className="text-4xl">Login</Heading>
          <View>
            <FormInput name="email" label="Email" error={login.error?.data?.zodError?.fieldErrors.email} />
          </View>
          <View>
            <FormInput
              name="password"
              secureTextEntry
              label="Password"
              error={login.error?.data?.zodError?.fieldErrors.password}
            />
          </View>
          <View className="space-y-1">
            <View>
              <Button isLoading={login.isLoading} disabled={login.isLoading} onPress={form.handleSubmit(handleLogin)}>
                Login
              </Button>
            </View>
            {login.error?.data?.formError && (
              <View>
                <FormError error={login.error.data.formError} />
              </View>
            )}
            <View className="mt-6 flex flex-row justify-between">
              <Link href="/" className="text-lg">
                Home
              </Link>

              <Link href="/register" className="text-lg">
                Register
              </Link>
            </View>
          </View>
        </ScrollView>
      </FormProvider>
    </KeyboardAvoidingView>
  )
}
