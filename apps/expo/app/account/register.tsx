import { FormProvider } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Link, useRouter } from "expo-router"
import { type z } from "zod"

import { Button } from "../../components/Button"
import { FormError } from "../../components/FormError"
import { FormInput } from "../../components/FormInput"
import { Heading } from "../../components/Heading"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { registerSchema } from "@ramble/shared"

export default function Register() {
  const queryClient = api.useContext()
  const router = useRouter()
  const login = api.auth.register.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.auth.me.setData(undefined, data.user)
      router.replace("/")
    },
  })
  const form = useForm({
    defaultValues: { email: "", password: "", username: "", firstName: "", lastName: "" },
    schema: registerSchema,
  })

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    await AsyncStorage.removeItem(AUTH_TOKEN)
    login.mutate(data)
  }

  return (
    <KeyboardAvoidingView>
      <FormProvider {...form}>
        <ScrollView className="h-full space-y-3 px-4 pt-16">
          <Heading className="text-4xl">Register</Heading>
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
          <View>
            <FormInput name="username" label="Username" error={login.error?.data?.zodError?.fieldErrors.username} />
          </View>
          <View>
            <FormInput name="firstName" label="First name" error={login.error?.data?.zodError?.fieldErrors.firstName} />
          </View>
          <View>
            <FormInput name="lastName" label="Last name" error={login.error?.data?.zodError?.fieldErrors.lastName} />
          </View>
          <View className="space-y-1">
            <View>
              <Button isLoading={login.isLoading} disabled={login.isLoading} onPress={form.handleSubmit(handleRegister)}>
                Register
              </Button>
            </View>
            {login.error?.data?.formError && (
              <View>
                <FormError error={login.error.data.formError} />
              </View>
            )}
          </View>
          <Link href="/login" className="mt-6 text-lg">
            Login
          </Link>
        </ScrollView>
      </FormProvider>
    </KeyboardAvoidingView>
  )
}
