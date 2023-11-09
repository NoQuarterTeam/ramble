import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"

import { Button } from "../../components/ui/Button"
import { FormError } from "../../components/ui/FormError"
import { FormInput } from "../../components/ui/FormInput"
import { Heading } from "../../components/ui/Heading"
import { api } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useMe } from "../../lib/hooks/useMe"
import { useRouter } from "../router"
import { AvoidSoftInputView } from "react-native-avoid-softinput"

export default function OnboardingStep1Screen() {
  const { me } = useMe()
  const form = useForm({ defaultValues: { bio: me?.bio || "" } })
  const router = useRouter()

  const utils = api.useUtils()
  const { mutate, isLoading, error } = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      router.push("OnboardingStep2Screen")
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))
  return (
    <FormProvider {...form}>
      <AvoidSoftInputView>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-4 pt-16">
            <Heading className="mb-4 text-2xl">Tell us a bit about youself</Heading>
            <FormInput
              multiline
              className="h-[100px]"
              name="bio"
              placeholder="Sustainability, nature, and the outdoors are my passions. I love to ramble and meet new people."
              label="A little bio, just a few words about yourself and your interests"
              error={error}
            />
          </View>
          <FormError error={error} />
          <View className="mt-4 flex flex-row items-center justify-between px-4">
            <View />
            <View className="flex flex-row items-center space-x-2">
              <Button onPress={() => router.push("OnboardingStep2Screen")} variant="link">
                Skip
              </Button>
              <Button className="w-[120px]" isLoading={isLoading} onPress={onSubmit}>
                Next
              </Button>
            </View>
          </View>
        </ScrollView>
      </AvoidSoftInputView>
    </FormProvider>
  )
}
