import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"

import { Button } from "../../components/ui/Button"
import { FormError } from "../../components/ui/FormError"
import { FormInput } from "../../components/ui/FormInput"
import { ModalView } from "../../components/ui/ModalView"
import { toast } from "../../components/ui/Toast"
import { api } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useKeyboardController } from "../../lib/hooks/useKeyboardController"
import { useRouter } from "../router"

export function RequestAccessScreen() {
  useKeyboardController()
  const navigation = useRouter()
  const { mutate, error, isLoading } = api.auth.requestAccess.useMutation({
    onSuccess: () => {
      if (navigation.canGoBack()) {
        navigation.goBack()
      } else {
        navigation.push("AppLayout")
      }
      toast({ title: "Thanks! We will get in contact soon!" })
    },
  })
  const form = useForm({
    defaultValues: { email: "" },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))

  return (
    <ModalView title="request access" onBack={() => navigation.navigate("AppLayout")}>
      <FormProvider {...form}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <FormInput autoCapitalize="none" name="email" label="Email" error={error} />

            <Button className="mb-1" isLoading={isLoading} onPress={onSubmit}>
              Request access
            </Button>

            <FormError className="mb-1" error={error} />
          </View>
        </ScrollView>
      </FormProvider>
    </ModalView>
  )
}
