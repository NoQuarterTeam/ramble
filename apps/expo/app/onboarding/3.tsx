import * as React from "react"
import { ScrollView, View } from "react-native"

import { Heading } from "../../components/ui/Heading"
import { useForm } from "../../lib/hooks/useForm"

import { useRouter } from "../router"
import { api } from "../../lib/api"
import { FormProvider } from "react-hook-form"

import { Button } from "../../components/ui/Button"

import { FormError } from "../../components/ui/FormError"
import { FormInput } from "../../components/ui/FormInput"

export default function OnboardingStep3Screen() {
  const { data, isLoading } = api.van.mine.useQuery()

  const form = useForm({
    defaultValues: {
      name: data?.name || "",
      model: data?.model || "",
      year: data?.year ? String(data?.year) : "",
      description: data?.description || "",
    },
  })

  React.useEffect(() => {
    if (!data || isLoading) return
    form.reset({
      name: data.name || "",
      model: data.model || "",
      year: data?.year ? String(data?.year) : "",
      description: data.description || "",
    })
  }, [data, isLoading])
  const router = useRouter()

  const utils = api.useContext()
  const {
    mutate,
    isLoading: updateLoading,
    error,
  } = api.van.upsert.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      router.replace("AppLayout")
    },
  })

  const onSubmit = form.handleSubmit((van) => mutate({ ...van, year: Number(van.year), id: data?.id }))
  return (
    <FormProvider {...form}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 400 }} showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-20">
          <Heading className="mb-4 text-2xl">Tell us a little bit about your van?</Heading>
          <FormInput error={error} name="name" label="What's it's name?" placeholder="Patrick" />
          <FormInput error={error} name="model" label="What type of van is it?" placeholder="Citroën Jumper" />
          <FormInput error={error} name="year" label="What year was it born?" placeholder="2013" />
          <FormInput error={error} multiline name="description" label="Anything else you wana mention?" />
        </View>
        <FormError error={error} />
      </ScrollView>
      <View className="absolute bottom-10 left-0 right-0 flex flex-row items-center justify-between px-4">
        <Button onPress={router.goBack} variant="ghost">
          Back
        </Button>
        <View className="flex flex-row items-center space-x-2">
          <Button onPress={() => router.replace("AppLayout")} variant="link">
            Skip
          </Button>
          <Button className="w-[120px]" isLoading={updateLoading} onPress={onSubmit}>
            Finish
          </Button>
        </View>
      </View>
    </FormProvider>
  )
}
