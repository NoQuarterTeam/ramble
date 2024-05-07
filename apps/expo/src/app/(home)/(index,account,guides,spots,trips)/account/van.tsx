import * as ImagePicker from "expo-image-picker"
import { Bike, Plus, ShowerHead, Wifi, X, Zap } from "lucide-react-native"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native"

import { VAN_SETTINGS, createAssetUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { VanSettingSelector } from "~/components/VanSettingsSelector"
import { Button } from "~/components/ui/Button"
import { FormInput, FormInputLabel } from "~/components/ui/FormInput"
import { Icons } from "~/components/ui/Icons"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useS3Upload } from "~/lib/hooks/useS3"

export default function VanScreen() {
  useKeyboardController()

  const { data, isLoading } = api.van.mine.useQuery()

  const form = useForm({
    defaultValues: {
      name: data?.name || "",
      model: data?.model || "",
      year: data?.year.toString() || "",
      description: data?.description || "",
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
      description: data.description || "",
      hasToilet: data.hasToilet,
      hasShower: data.hasShower,
      hasElectricity: data.hasElectricity,
      hasInternet: data.hasInternet,
      hasBikeRack: data.hasBikeRack,
    })
  }, [data, form, isLoading])

  const utils = api.useUtils()
  const {
    mutate,
    isPending: updateLoading,
    error,
  } = api.van.upsert.useMutation({
    onSuccess: (res) => {
      form.reset({
        name: res.name,
        model: res.model,
        year: res.year.toString(),
        description: res.description || "",
        hasToilet: res.hasToilet,
        hasShower: res.hasShower,
        hasElectricity: res.hasElectricity,
        hasInternet: res.hasInternet,
        hasBikeRack: res.hasBikeRack,
      })
      toast({ title: "Van updated." })
    },
  })

  const onSubmit = form.handleSubmit((van) => {
    Keyboard.dismiss()
    const { name, model, year } = van
    if (!model) return toast({ title: "Model is required" })
    if (!name) return toast({ title: "Name is required" })
    if (!year) return toast({ title: "Year is required" })
    mutate({ ...van, model, name, year: Number(year), id: data?.id })
  })

  const { mutate: removeImage } = api.van.removeImage.useMutation({
    onSuccess: async () => {
      await utils.van.mine.refetch()
    },
  })
  const [isSavingImagesLoading, setIsSavingImagesLoading] = React.useState(false)

  const { mutate: saveImages } = api.van.saveImages.useMutation({
    onSuccess: async () => {
      await utils.van.mine.refetch()
    },
    onSettled: () => setIsSavingImagesLoading(false),
  })
  const [upload, { isLoading: isUploadLoading }] = useS3Upload()

  const onPickImage = async () => {
    setIsSavingImagesLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 10,
        quality: 1,
      })
      if (result.canceled || result.assets.length === 0) return
      const paths = await Promise.all(result.assets.map((asset) => upload(asset.uri)))
      saveImages({ paths })
    } catch (error) {
      let message: string
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
      setIsSavingImagesLoading(false)
    }
  }

  const hasToilet = form.watch("hasToilet")
  const hasShower = form.watch("hasShower")
  const hasElectricity = form.watch("hasElectricity")
  const hasInternet = form.watch("hasInternet")
  const hasBikeRack = form.watch("hasBikeRack")

  const isDirty = form.formState.isDirty
  return (
    <FormProvider {...form}>
      <ScreenView
        title="Van"
        rightElement={
          isDirty ? (
            <Button isLoading={updateLoading} variant="link" size="sm" onPress={onSubmit}>
              Save
            </Button>
          ) : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          <FormInput name="name" label="Name" error={error} />
          <View className="flex items-center flex-row gap-4">
            <View className="flex-1">
              <FormInput name="model" label="Model" error={error} />
            </View>
            <View className="flex-1">
              <FormInput name="year" label="Year" error={error} />
            </View>
          </View>
          <FormInput multiline name="description" label="Description" error={error} />

          <View className="space-y-0.5">
            <View className="flex flex-row gap-2">
              <View className="flex-1">
                <VanSettingSelector
                  onToggle={() => form.setValue("hasToilet", !hasToilet, { shouldDirty: true })}
                  icon={Icons.Toilet}
                  label={VAN_SETTINGS.hasToilet}
                  isSelected={hasToilet}
                />
              </View>
              <View className="flex-1">
                <VanSettingSelector
                  onToggle={() => form.setValue("hasShower", !hasShower, { shouldDirty: true })}
                  icon={ShowerHead}
                  label={VAN_SETTINGS.hasShower}
                  isSelected={hasShower}
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
          <View />
          <View className="pt-2">
            {data && (
              <View>
                <FormInputLabel label="Images" />
                <View className="flex flex-row flex-wrap">
                  {data?.images.map((image) => (
                    <TouchableOpacity key={image.id} onPress={() => removeImage({ id: image.id })} className="w-1/3 p-1">
                      <OptimizedImage
                        height={200}
                        placeholder={image.blurHash}
                        width={300}
                        className="h-[100px] w-full rounded-xs bg-gray-50 object-cover dark:bg-gray-700"
                        source={{ uri: createAssetUrl(image.path) }}
                      />
                      <View className="-right-1 -top-1 absolute rounded-full bg-gray-100 p-1 dark:bg-gray-900">
                        <Icon icon={X} size={16} />
                      </View>
                    </TouchableOpacity>
                  ))}
                  <View className="w-1/3 p-1">
                    <Button
                      className="h-[100px]"
                      isLoading={isUploadLoading || isSavingImagesLoading}
                      variant="secondary"
                      onPress={onPickImage}
                    >
                      <Icon icon={Plus} />
                    </Button>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenView>
    </FormProvider>
  )
}
