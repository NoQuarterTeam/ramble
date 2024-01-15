import * as React from "react"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { AvoidSoftInputView } from "react-native-avoid-softinput"
import { SafeAreaView } from "react-native-safe-area-context"

import { Button } from "../../components/ui/Button"
import { FormError } from "../../components/ui/FormError"
import { FormInput } from "../../components/ui/FormInput"
import { Heading } from "../../components/ui/Heading"
import { toast } from "../../components/ui/Toast"
import { api } from "../../lib/api"
import { useForm } from "../../lib/hooks/useForm"
import { useRouter } from "../router"

export default function OnboardingStep3Screen() {
  const { data, isLoading } = api.van.mine.useQuery()

  const form = useForm({
    defaultValues: { name: data?.name, model: data?.model, year: data?.year, description: data?.description },
  })

  React.useEffect(() => {
    if (!data || isLoading) return
    form.reset({ name: data.name, model: data.model, year: data.year, description: data.description })
  }, [data, form, isLoading])
  const router = useRouter()

  const utils = api.useUtils()
  const {
    mutate,
    isLoading: updateLoading,
    error,
  } = api.van.upsert.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      router.navigate("AppLayout")
      router.navigate("NewSpotLayout", { canClose: false })
    },
  })

  const onSubmit = form.handleSubmit((van) => {
    const { name, model, year } = van
    if (!model) return toast({ title: "Model is required" })
    if (!name) return toast({ title: "Name is required" })
    if (!year) return toast({ title: "Year is required" })
    mutate({ model, name, year, id: data?.id })
  })
  return (
    <SafeAreaView className="flex-1 px-4">
      <FormProvider {...form}>
        <AvoidSoftInputView>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
            className="space-y-4"
          >
            <Heading className="text-2xl">Tell us a little bit about your van?</Heading>
            <FormInput error={error} name="name" label="What's it's name?" placeholder="Patrick" />
            <FormInput error={error} name="model" label="What type of van is it?" placeholder="Citroën Jumper" />
            <FormInput error={error} name="year" label="What year was it born?" placeholder="2013" />
            <FormInput error={error} multiline name="description" label="Anything else you wanna mention?" />

            <FormError error={error} />
            <View className="flex flex-row items-center justify-between">
              <Button onPress={router.goBack} variant="ghost">
                Back
              </Button>
              <View className="flex flex-row items-center space-x-2">
                <Button
                  onPress={() => {
                    router.replace("AppLayout")
                    router.navigate("NewSpotLayout", { canClose: false })
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
    </SafeAreaView>
  )
}
