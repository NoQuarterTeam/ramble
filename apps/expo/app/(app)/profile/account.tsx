import { FormProvider } from "react-hook-form"
import { ScrollView, TouchableOpacity, View } from "react-native"
import * as ImagePicker from "expo-image-picker"

import { Button } from "../../../components/ui/Button"
import { FormError } from "../../../components/ui/FormError"
import { FormInput } from "../../../components/ui/FormInput"
import { ScreenView } from "../../../components/ui/ScreenView"
import { toast } from "../../../components/ui/Toast"
import { api } from "../../../lib/api"
import { useForm } from "../../../lib/hooks/useForm"
import { useMe } from "../../../lib/hooks/useMe"
import { Edit2, User2 } from "lucide-react-native"
import { Image } from "expo-image"
import { createImageUrl } from "@ramble/shared"
import { useS3Upload } from "../../../lib/hooks/useS3"
import { Spinner } from "../../../components/ui/Spinner"

export function AccountScreen() {
  const { me } = useMe()

  const form = useForm({
    defaultValues: {
      bio: me?.bio || "",
      firstName: me?.firstName || "",
      lastName: me?.lastName || "",
      email: me?.email || "",
      username: me?.username || "",
    },
  })

  const utils = api.useContext()
  const { mutate, isLoading, error } = api.user.update.useMutation({
    onSuccess: (data) => {
      utils.user.me.setData(undefined, data)
      toast({ title: "Account updated." })
    },
  })

  const onSubmit = form.handleSubmit((data) => mutate(data))

  const { mutate: saveAvatar, isLoading: isAvatarSavingLoading } = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      toast({ title: "Avatar updated." })
    },
  })
  const [upload, { isLoading: isUploadLoading }] = useS3Upload()

  const onPickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        quality: 1,
      })
      if (result.canceled || !result.assets[0]?.uri) return
      const { key } = await upload(result.assets[0].uri)
      saveAvatar({ avatar: key })
    } catch (error) {
      let message
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  return (
    <ScreenView title="Account">
      <FormProvider {...form}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 350 }} showsVerticalScrollIndicator={false}>
          <View className="flex w-full items-center justify-center">
            <TouchableOpacity onPress={onPickImage}>
              {isUploadLoading || isAvatarSavingLoading ? (
                <View className="sq-20 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                  <Spinner />
                </View>
              ) : me?.avatar ? (
                <Image
                  source={{ uri: createImageUrl(me.avatar) }}
                  className="sq-20 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
              ) : (
                <View className="sq-20 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                  <User2 className="text-black dark:text-white" />
                </View>
              )}
              <View className="sq-8 absolute -right-1 -top-1 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700">
                <Edit2 size={12} className="text-black dark:text-white" />
              </View>
            </TouchableOpacity>
          </View>
          <FormInput name="firstName" label="First name" error={error} />
          <FormInput name="lastName" label="Last name" error={error} />
          <FormInput autoCapitalize="none" name="email" label="Email" error={error} />
          <FormInput autoCapitalize="none" name="username" label="Username" error={error} />
          <FormInput multiline className="h-[100px]" name="bio" label="Bio" error={error} />
          <Button isLoading={isLoading} onPress={onSubmit}>
            Save
          </Button>
          <FormError error={error} />
        </ScrollView>
      </FormProvider>
    </ScreenView>
  )
}
