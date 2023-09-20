import * as React from "react"
import { FormProvider } from "react-hook-form"
import { ScrollView, TouchableOpacity, View } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Plus, X } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { Button } from "../../../components/ui/Button"
import { FormError } from "../../../components/ui/FormError"
import { FormInput, FormInputLabel } from "../../../components/ui/FormInput"
import { OptimizedImage } from "../../../components/ui/OptimisedImage"
import { ScreenView } from "../../../components/ui/ScreenView"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useForm } from "../../../lib/hooks/useForm"
import { useKeyboardController } from "../../../lib/hooks/useKeyboardController"
import { useS3Upload } from "../../../lib/hooks/useS3"

export function VanScreen() {
  useKeyboardController()

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
  }, [data, form, isLoading])

  const utils = api.useContext()
  const {
    mutate,
    isLoading: updateLoading,
    error,
  } = api.van.upsert.useMutation({
    onSuccess: () => {
      form.reset({}, { keepValues: true })
      toast({ title: "Van updated." })
    },
  })

  const onSubmit = form.handleSubmit((van) => mutate({ ...van, year: Number(van.year), id: data?.id }))

  const { mutate: removeImage } = api.van.removeImage.useMutation({
    onSuccess: async () => {
      await utils.van.mine.refetch()
    },
  })
  const { mutate: saveImages, isLoading: isSavingImagesLoading } = api.van.saveImages.useMutation({
    onSuccess: async () => {
      await utils.van.mine.refetch()
    },
  })
  const [upload, { isLoading: isUploadLoading }] = useS3Upload()

  const onPickImage = async () => {
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
      let message
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

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
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
          <FormInput name="name" label="Name" error={error} />
          <FormInput name="model" label="Model" error={error} />
          <FormInput name="year" label="Year" error={error} />
          <FormInput multiline name="description" label="Description" error={error} />
          <FormError error={error} />
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
                      className="rounded-xs h-[100px] w-full bg-gray-50 object-cover dark:bg-gray-700"
                      source={{ uri: createImageUrl(image.path) }}
                    />
                    <View className="absolute -right-1 -top-1 rounded-full bg-gray-100 p-1 dark:bg-gray-900">
                      <X className="text-gray-800 dark:text-white" size={16} />
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
                    <Plus className="text-black dark:text-white" />
                  </Button>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </ScreenView>
    </FormProvider>
  )
}
