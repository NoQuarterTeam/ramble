import { VAN_SETTINGS } from "@ramble/shared"
import { useRouter } from "expo-router"
import { Bike, ShowerHead, Wifi, Zap } from "lucide-react-native"
import { usePostHog } from "posthog-react-native"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { ScrollView, View } from "react-native"
import { AvoidSoftInputView } from "react-native-avoid-softinput"

import { SafeAreaView } from "~/components/SafeAreaView"
import { VanSettingSelector } from "~/components/VanSettingsSelector"
import { Button } from "~/components/ui/Button"
import { FormInput } from "~/components/ui/FormInput"
import { Heading } from "~/components/ui/Heading"
import { Icons } from "~/components/ui/Icons"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"

export default function OnboardingStep3Screen() {
  const { data, isLoading } = api.van.mine.useQuery()

  const form = useForm({
    defaultValues: {
      name: data?.name,
      model: data?.model,
      year: data?.year.toString(),
      description: data?.description,
      hasToilet: data?.hasToilet || false,
      hasShower: data?.hasShower || false,
      hasElectricity: data?.hasElectricity || false,
      hasInternet: data?.hasInternet || false,
      hasBikeRack: data?.hasBikeRack || false,
    },
  })

  React.useEffect(() => {
    if (!data || isLoading) return
    form.reset({
      name: data.name,
      model: data.model,
      year: data.year.toString(),
      description: data.description,
      hasToilet: data.hasToilet || false,
      hasShower: data.hasShower || false,
      hasElectricity: data.hasElectricity || false,
      hasInternet: data.hasInternet || false,
      hasBikeRack: data.hasBikeRack || false,
    })
  }, [data, form, isLoading])
  const router = useRouter()

  const utils = api.useUtils()
  const posthog = usePostHog()
  const {
    mutate,
    isPending: updateLoading,
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
    mutate({ ...van, model, name, year: Number(year), id: data?.id, description: van.description })
  })
  const hasToilet = form.watch("hasToilet")
  const hasShower = form.watch("hasShower")
  const hasElectricity = form.watch("hasElectricity")
  const hasInternet = form.watch("hasInternet")
  const hasBikeRack = form.watch("hasBikeRack")

  return (
    <SafeAreaView>
      <View className="flex-1 px-4 pt-4">
        <FormProvider {...form}>
          <AvoidSoftInputView>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
              className="space-y-2"
              showsVerticalScrollIndicator={false}
            >
              <Heading className="text-2xl">Tell us a little bit about your van?</Heading>
              <View>
                <FormInput error={error} name="name" label="What's it's name?" placeholder="Patrick" />

                <View className="flex items-center flex-row gap-4">
                  <View className="flex-1">
                    <FormInput error={error} name="model" label="What type of van is it?" placeholder="Citroën Jumper" />
                  </View>
                  <View className="flex-1">
                    <FormInput error={error} name="year" label="What year was it born?" placeholder="2013" />
                  </View>
                </View>

                <FormInput error={error} multiline name="description" label="Anything else you wanna mention?" />
              </View>

              <View className="space-y-0.5">
                <View className="flex flex-row gap-2">
                  <View className="flex-1">
                    <VanSettingSelector
                      onToggle={() => form.setValue("hasShower", !hasShower, { shouldDirty: true })}
                      icon={ShowerHead}
                      label={VAN_SETTINGS.hasShower}
                      isSelected={hasShower}
                    />
                  </View>
                  <View className="flex-1">
                    <VanSettingSelector
                      onToggle={() => form.setValue("hasToilet", !hasToilet, { shouldDirty: true })}
                      icon={Icons.Toilet}
                      label={VAN_SETTINGS.hasToilet}
                      isSelected={hasToilet}
                    />
                  </View>
                </View>
                <View className="flex flex-row gap-2">
                  <View className="flex-1">
                    <VanSettingSelector
                      onToggle={() => form.setValue("hasElectricity", !hasElectricity, { shouldDirty: true })}
                      icon={Zap}
                      label={VAN_SETTINGS.hasElectricity}
                      isSelected={hasElectricity}
                    />
                  </View>
                  <View className="flex-1">
                    <VanSettingSelector
                      onToggle={() => form.setValue("hasInternet", !hasInternet, { shouldDirty: true })}
                      icon={Wifi}
                      label={VAN_SETTINGS.hasInternet}
                      isSelected={hasInternet}
                    />
                  </View>
                </View>
                <View className="flex flex-row gap-2">
                  <View className="flex-1">
                    <VanSettingSelector
                      onToggle={() => form.setValue("hasBikeRack", !hasBikeRack, { shouldDirty: true })}
                      icon={Bike}
                      label={VAN_SETTINGS.hasBikeRack}
                      isSelected={hasBikeRack}
                    />
                  </View>
                  <View className="flex-1" />
                </View>
              </View>

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
