import * as FileSystem from "expo-file-system"
import * as ImagePicker from "expo-image-picker"
import { Edit2, User2 } from "lucide-react-native"
import * as React from "react"
import { FormProvider } from "react-hook-form"
import { Keyboard, Platform, ScrollView, TouchableOpacity, View } from "react-native"

import { createAssetUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { FormInput } from "~/components/ui/FormInput"
import { OptimizedImage } from "~/components/ui/OptimisedImage"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { type FileInfo, TEN_MB } from "~/lib/fileSystem"
import { useForm } from "~/lib/hooks/useForm"
import { useKeyboardController } from "~/lib/hooks/useKeyboardController"
import { useMe } from "~/lib/hooks/useMe"
import { useS3Upload } from "~/lib/hooks/useS3"

const MAX_TAGS = 5

export default function AccountInfoScreen() {
  useKeyboardController()
  const { me } = useMe()

  const { data: tagOptions, isLoading: isTagOptionsLoading } = api.user.tagOptions.useQuery()
  const { data: myTags, isLoading: isMyTagsLoading } = api.user.myTags.useQuery()

  const initialTagIds = myTags?.map((tag) => tag.id) || []
  const [selectedTagIds, setSelectedTagIds] = React.useState(initialTagIds)

  const form = useForm({
    defaultValues: {
      firstName: me?.firstName || "",
      lastName: me?.lastName || "",
      email: me?.email || "",
      username: me?.username || "",
      instagram: me?.instagram,
      bio: me?.bio,
    },
  })

  const utils = api.useUtils()
  const {
    mutate,
    isPending: isLoading,
    error,
  } = api.user.update.useMutation({
    onSuccess: (data) => {
      utils.user.me.setData(undefined, data)
      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        instagram: data.instagram,
        bio: data.bio,
      })
      utils.user.myTags.refetch()
      toast({ title: "Account updated." })
    },
  })

  const onSubmit = form.handleSubmit((data) => {
    if (data.username.trim().includes(" ")) return toast({ title: "Username can not contain empty spaces" })
    Keyboard.dismiss()
    mutate({ ...data, tagIds: selectedTagIds })
  })

  const { mutate: saveAvatar, isPending: isAvatarSavingLoading } = api.user.update.useMutation({
    onSuccess: async () => {
      await utils.user.me.refetch()
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Avatar updated." })
    },
  })
  const [upload, { isLoading: isUploadLoading }] = useS3Upload()

  const onPickImage = async () => {
    try {
      const quality = Platform.OS === "ios" ? 0.3 : 0.4
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        allowsMultipleSelection: false,
        selectionLimit: 1,
        quality,
      })
      if (result.canceled || !result.assets[0]?.uri) return

      // Android doesn't have result.fileSize available, so need to use expo filesystem instead
      const info: FileInfo = await FileSystem.getInfoAsync(result.assets[0].uri)
      if (info.size && info.size > TEN_MB) {
        throw new Error("Please select an image with a smaller filesize")
      }

      const key = await upload(result.assets[0].uri)
      saveAvatar({ avatar: key })
    } catch (error) {
      let message: string
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      const newTags = selectedTagIds.filter((selectedTagId) => tagId !== selectedTagId)
      setSelectedTagIds(newTags)
    } else {
      if (selectedTagIds.length === MAX_TAGS) return
      setSelectedTagIds([...selectedTagIds, tagId])
    }
  }

  const isDirty = form.formState.isDirty
  const areTagsChanged = initialTagIds.sort().join(",") !== selectedTagIds.sort().join(",")
  return (
    <FormProvider {...form}>
      <ScreenView
        title="Info"
        rightElement={
          isDirty || areTagsChanged ? (
            <Button isLoading={isLoading} variant="link" size="sm" onPress={onSubmit}>
              Save
            </Button>
          ) : undefined
        }
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View className="flex w-full items-center justify-center pt-2">
            <TouchableOpacity onPress={onPickImage}>
              {isUploadLoading || isAvatarSavingLoading ? (
                <View className="sq-20 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                  <Spinner />
                </View>
              ) : me?.avatar ? (
                <OptimizedImage
                  width={80}
                  height={80}
                  placeholder={me.avatarBlurHash}
                  source={{ uri: createAssetUrl(me.avatar) }}
                  className="sq-20 rounded-full bg-gray-100 object-cover dark:bg-gray-700"
                />
              ) : (
                <View className="sq-20 flex items-center justify-center rounded-full bg-gray-100 object-cover dark:bg-gray-700">
                  <Icon icon={User2} />
                </View>
              )}
              <View className="sq-8 -right-1 -top-1 absolute flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700">
                <Icon icon={Edit2} size={12} />
              </View>
            </TouchableOpacity>
          </View>
          <FormInput name="firstName" label="First name" error={error} />
          <FormInput name="lastName" label="Last name" error={error} />
          <FormInput autoCapitalize="none" name="email" label="Email" error={error} />
          <FormInput autoCapitalize="none" name="username" label="Username" error={error} />
          <FormInput multiline name="bio" label="Bio" error={error} />
          <FormInput
            autoCapitalize="none"
            name="instagram"
            label="Instagram handle"
            subLabel="This will be used to promote your instagram and gives other ramble users a way to contact you"
            error={error}
          />

          <View className="mb-4">
            <View className="flex flex-row justify-between">
              <Text className="leading-6">Describe yourself</Text>
              <Text className="opacity-70">
                {selectedTagIds.length}/{MAX_TAGS}
              </Text>
            </View>
            {isTagOptionsLoading || isMyTagsLoading ? (
              <Spinner />
            ) : (
              <View className="flex flex-row flex-wrap gap-2">
                {tagOptions?.map((tag) => (
                  <Button
                    key={tag.id}
                    size="xs"
                    variant={selectedTagIds.includes(tag.id) ? "primary" : "outline"}
                    onPress={() => handleToggleTag(tag.id)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </ScreenView>
    </FormProvider>
  )
}
