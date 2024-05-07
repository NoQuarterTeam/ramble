import * as ImagePicker from "expo-image-picker"
import { Plus, X } from "lucide-react-native"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native"
import { AvoidSoftInputView } from "react-native-avoid-softinput"

import { createAssetUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInput, FormInputLabel } from "~/components/ui/FormInput"
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
    defaultValues: { name: data?.name, model: data?.model, year: data?.year.toString(), description: data?.description },
  })

  React.useEffect(() => {
    if (!data || isLoading) return
    form.reset({ name: data.name, model: data.model, year: data.year.toString(), description: data.description })
  }, [data, form, isLoading])

  const utils = api.useUtils()
  const {
    mutate,
    isPending: updateLoading,
    error,
  } = api.van.upsert.useMutation({
    onSuccess: (res) => {
      form.reset({ name: res.name, model: res.model, year: res.year.toString(), description: res.description })
      toast({ title: "Van updated." })
    },
  })

  const onSubmit = form.handleSubmit((van) => {
    Keyboard.dismiss()
    const { name, model, year } = van
    if (!model) return toast({ title: "Model is required" })
    if (!name) return toast({ title: "Name is required" })
    if (!year) return toast({ title: "Year is required" })
    mutate({ model, name, year: Number(year), id: data?.id })
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
        <AvoidSoftInputView>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            <FormInput name="name" label="Name" error={error} />
            <FormInput name="model" label="Model" error={error} />
            <FormInput name="year" label="Year" error={error} />
            <FormInput multiline name="description" label="Description" error={error} />
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
          </ScrollView>
        </AvoidSoftInputView>
      </ScreenView>
    </FormProvider>
  )
}
