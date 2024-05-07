import { useRouter } from "expo-router"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { AvoidSoftInputView } from "react-native-avoid-softinput"

import { SafeAreaView } from "~/components/SafeAreaView"
import { Button } from "~/components/ui/Button"
import { FormError } from "~/components/ui/FormError"
import { FormInput } from "~/components/ui/FormInput"
import { Heading } from "~/components/ui/Heading"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"

export default function OnboardingStep3Screen() {
  const { data, isLoading } = api.van.mine.useQuery()

  const form = useForm({
    defaultValues: { name: data?.name, model: data?.model, year: data?.year.toString(), description: data?.description },
  })

  React.useEffect(() => {
    if (!data || isLoading) return
    form.reset({ name: data.name, model: data.model, year: data.year.toString(), description: data.description })
  }, [data, form, isLoading])
  const router = useRouter()

  const utils = api.useUtils()
  const posthog = usePostHog()
  const {
    mutate,
    isLoading: updateLoading,
    error,
  } = api.van.upsert.useMutation({
    onSuccess: async () => {
      posthog.capture("user completed onboarding")
      await utils.user.me.refetch()
      router.navigate("/")
      router.navigate("/new")
    },
  })

  const onSubmit = form.handleSubmit((van) => {
    const { name, model, year } = van
    if (!model) return toast({ title: "Model is required" })
    if (!name) return toast({ title: "Name is required" })
    if (!year) return toast({ title: "Year is required" })
    mutate({ model, name, year: Number(year), id: data?.id, description: van.description })
  })
  return (
    <SafeAreaView>
      <View className="flex-1 px-4">
        <FormProvider {...form}>
          <AvoidSoftInputView>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
              showsVerticalScrollIndicator={false}
            >
              <Heading className="text-2xl">Tell us a little bit about your van?</Heading>
              <View>
                <FormInput error={error} name="name" label="What's it's name?" placeholder="Patrick" />
              </View>
              <View>
                <FormInput error={error} name="model" label="What type of van is it?" placeholder="Citroën Jumper" />
              </View>
              <View>
                <FormInput error={error} name="year" label="What year was it born?" placeholder="2013" />
              </View>
              <View>
                <FormInput error={error} multiline name="description" label="Anything else you wanna mention?" />
              </View>

              <FormError error={error} />
              <View className="flex flex-row items-center justify-between">
                <Button onPress={router.back} variant="ghost">
                  Back
                </Button>
                <View className="flex flex-row items-center space-x-2">
                  <Button
                    onPress={() => {
                      router.navigate("/")
                      router.navigate("/new")
                    }}
                    variant="link"
                  >
                    Skip
                  </Button>
                  <Button className="w-[120px]" isLoading={updateLoading} onPress={onSubmit}>
                    Finish
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
