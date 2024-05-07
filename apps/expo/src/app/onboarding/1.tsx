import { Link, useRouter } from "expo-router"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { AvoidSoftInputView } from "react-native-avoid-softinput"

import { SafeAreaView } from "~/components/SafeAreaView"
import { Button } from "~/components/ui/Button"
import { FormInput } from "~/components/ui/FormInput"
import { Heading } from "~/components/ui/Heading"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useMe } from "~/lib/hooks/useMe"

export default function OnboardingStep1Screen() {
  const { me } = useMe()
  const form = useForm({ defaultValues: { bio: me?.bio || "" } })
  const router = useRouter()

  const utils = api.useUtils()
  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      router.push("/onboarding/2")
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))

  return (
    <SafeAreaView>
      <View className="flex-1 px-4">
        <FormProvider {...form}>
          <AvoidSoftInputView>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              className="space-y-4"
            >
              <Heading className="text-2xl">Tell us a bit about youself</Heading>
              <FormInput
                multiline
                className="h-[100px]"
                name="bio"
                placeholder="Sustainability, nature, and the outdoors are my passions. I love to ramble and meet new people."
                label="A little bio, just a few words about yourself and your interests"
                error={error}
              />

              <View className="flex flex-row items-center justify-between">
                <View />
                <View className="flex flex-row items-center space-x-2">
                  <Link asChild href="/onboarding/2">
                    <Button variant="link">Skip</Button>
                  </Link>

                  <Button className="w-[120px]" isLoading={isLoading} onPress={onSubmit}>
                    Next
                  </Button>
                </View>
              </View>
            </ScrollView>
          </AvoidSoftInputView>
        </FormProvider>
      </View>
    </SafeAreaView>
  )
}
