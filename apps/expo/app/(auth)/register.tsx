import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Button } from "../../components/ui/Button"
import { FormError } from "../../components/ui/FormError"
import { FormInput } from "../../components/ui/FormInput"
import { ModalView } from "../../components/ui/ModalView"
import { toast } from "../../components/ui/Toast"
import { api, AUTH_TOKEN } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useKeyboardController } from "../../lib/hooks/useKeyboardController"
import { useRouter } from "../router"

export function RegisterScreen() {
  useKeyboardController()
  const queryClient = api.useUtils()
  const navigation = useRouter()
  const { mutate, error, isLoading } = api.auth.register.useMutation({
    onSuccess: async (data) => {
      await AsyncStorage.setItem(AUTH_TOKEN, data.token)
      queryClient.user.me.setData(undefined, data.user)
      navigation.replace("OnboardingLayout")
    },
  })
  const form = useForm({
    defaultValues: { code: "", email: "", password: "", username: "", firstName: "", lastName: "" },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    if (data.username.trim().includes(" ")) return toast({ title: "Username can not contain empty spaces" })
    await AsyncStorage.removeItem(AUTH_TOKEN).catch()
    mutate(data)
  })

  return (
    <ModalView title="register" onBack={() => navigation.navigate("AppLayout")}>
      <FormProvider {...form}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
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
            <Button className="mb-1" variant="link" onPress={() => navigation.replace("RequestAccessScreen")}>
              No code? Request access
            </Button>

            <FormError className="mb-1" error={error} />
          </View>

          <View className="flex flex-row items-center justify-center">
            <Button className="px-1" variant="link" onPress={() => navigation.replace("LoginScreen")}>
              Login
            </Button>
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
