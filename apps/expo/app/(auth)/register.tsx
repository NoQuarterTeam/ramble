import { FormProvider } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Link, useNavigation, useRouter, useSearchParams } from "expo-router"
import { type z } from "zod"

import { registerSchema } from "@ramble/api/src/schemas/user"

import { Button } from "../../components/Button"
import { FormError } from "../../components/FormError"
import { FormInput } from "../../components/FormInput"
import { ModalView } from "../../components/ModalView"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"

export default function Register() {
  const queryClient = api.useContext()
  const router = useRouter()
  const navigation = useNavigation()
  const { profile } = useSearchParams<{ profile: string }>()
  const login = api.auth.register.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.auth.me.setData(undefined, data.user)
      if (profile === "true" || !navigation.canGoBack()) {
        router.replace({ pathname: "/[username]", params: { username: data.user.username } })
      } else {
        router.back()
      }
    },
  })
  const form = useForm({
    schema: registerSchema,
    defaultValues: { email: "", password: "", username: "", firstName: "", lastName: "" },
  })

  const handleRegister = async (data: z.infer<typeof registerSchema>) => {
    await AsyncStorage.removeItem(AUTH_TOKEN)
    login.mutate(data)
  }

  return (
    <ModalView title="Register">
      <KeyboardAvoidingView>
        <FormProvider {...form}>
          <ScrollView className="h-full">
            <FormInput name="email" label="Email" error={login.error?.data?.zodError?.fieldErrors.email} />
            <FormInput
              name="password"
              secureTextEntry
              label="Password"
              error={login.error?.data?.zodError?.fieldErrors.password}
            />
            <FormInput name="username" label="Username" error={login.error?.data?.zodError?.fieldErrors.username} />
            <FormInput name="firstName" label="First name" error={login.error?.data?.zodError?.fieldErrors.firstName} />
            <FormInput name="lastName" label="Last name" error={login.error?.data?.zodError?.fieldErrors.lastName} />
            <Button
              className="mb-1"
              isLoading={login.isLoading}
              disabled={login.isLoading}
              onPress={form.handleSubmit(handleRegister)}
            >
              Register
            </Button>
            {login.error?.data?.formError && <FormError className="mb-1" error={login.error.data.formError} />}
            <Link href={`/login${profile === "true" ? "?profile=true" : ""}`} className="text-lg">
              Login
            </Link>
          </ScrollView>
        </FormProvider>
      </KeyboardAvoidingView>
    </ModalView>
  )
}
