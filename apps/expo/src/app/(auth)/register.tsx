import AsyncStorage from "@react-native-async-storage/async-storage"
import { useLocalSearchParams, useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"

import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput } from "~/components/ui/FormInput"
import { ModalView } from "~/components/ui/ModalView"
import { toast } from "~/components/ui/Toast"
import { AUTH_TOKEN, api } from "~/lib/api"
import { IS_DEV } from "~/lib/config"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"

export default function RegisterScreen() {
  useKeyboardController()
  const { code, email } = useLocalSearchParams<{ code?: string; email?: string }>()

  const queryClient = api.useUtils()
  const navigation = useRouter()
  const posthog = usePostHog()
  const {
    mutate,
    error,
    isPending: isLoading,
  } = api.auth.register.useMutation({
    onSuccess: async (data) => {
      posthog.capture("user registered")
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.user.me.setData(undefined, data.user)
      navigation.replace("/onboarding/1")
    },
  })
  const form = useForm({
    defaultValues: { code: code || "", email: email || "", password: "", username: "", firstName: "", lastName: "" },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    let parsedData = data
    if (IS_DEV && !data.code) {
      const randomString = Math.random().toString(36).substring(7)
      const randomInt = Math.floor(Math.random() * 1000)
      parsedData = {
        username: randomString,
        email: `${randomString}@noquarter.co`,
        code: "DEV",
        password: "password",
        firstName: "Test",
        lastName: `User${randomInt}`,
      }
    }
    if (parsedData.username.trim().includes(" ")) return toast({ title: "Username can not contain empty spaces" })
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(parsedData)
  })

  return (
    <ModalView shouldRenderToast title="register" onBack={() => navigation.back()}>
      <FormProvider {...form}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <FormInput name="code" label="Invite code" autoCapitalize="characters" error={error} />
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
              autoComplete="password-new"
              secureTextEntry
              label="Password"
              error={error}
            />
            <FormInput autoCapitalize="none" name="username" autoComplete="username" label="Username" error={error} />
            <FormInput name="firstName" label="First name" autoComplete="nickname" error={error} />
            <FormInput name="lastName" label="Last name" autoComplete="family-name" error={error} />
            <Button className="mb-1" isLoading={isLoading} onPress={onSubmit}>
              Register
            </Button>
            <Button className="mb-1" variant="link" onPress={() => navigation.replace("/request-access")}>
              No code? Request access
            </Button>
          </View>

          <View className="flex flex-row items-center justify-center">
            <Button className="px-1" variant="link" onPress={() => navigation.replace("/login")}>
              Login
            </Button>
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
