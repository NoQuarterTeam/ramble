import * as Sentry from "@sentry/react-native"
import * as FileSystem from "expo-file-system"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Plus, X } from "lucide-react-native"
import * as React from "react"
import { Platform, ScrollView, TouchableOpacity, View } from "react-native"

import { createAssetUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { toast } from "~/components/ui/Toast"
import { useTabSegment } from "~/lib/hooks/useTabSegment"

import { type FileInfo, TEN_MB } from "~/lib/fileSystem"
import { EditSpotModalView } from "./EditSpotModalView"

export default function EditSpotImagesScreen() {
  const { id, ...params } = useLocalSearchParams<{ id: string; images: string }>()
  const [images, setImages] = React.useState<string[]>(params.images.split(","))

  const onPickImage = async () => {
    try {
      const quality = Platform.OS === "ios" ? 0.3 : 0.4
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality,
      })
      if (result.canceled || result.assets.length === 0) return
      await Promise.all(
        result.assets.map(async (asset) => {
          const { uri } = asset
          // Android doesn't have result.fileSize available, so need to use expo filesystem instead
          const info: FileInfo = await FileSystem.getInfoAsync(uri)
          if (info.size && info.size > TEN_MB) {
            throw new Error("Please select an image with a smaller filesize")
          }
        }),
      )
      setImages((i) => [...i, ...result.assets.map((asset) => asset.uri)])
    } catch (error) {
      Sentry.captureException(error)
      let message: string
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  const tab = useTabSegment()
  const router = useRouter()
  return (
    <EditSpotModalView title="upload images">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex flex-row flex-wrap">
          {images.map((image) => (
            <TouchableOpacity key={image} onPress={() => setImages((im) => im.filter((i) => i !== image))} className="w-1/3 p-1">
              <Image
                className="h-[100px] w-full rounded-xs bg-gray-50 object-cover dark:bg-gray-700"
                source={{ uri: image.startsWith("file://") ? image : createAssetUrl(image) }}
              />
              <View className="-right-1 -top-1 absolute rounded-full bg-gray-100 p-1 dark:bg-gray-900">
                <Icon icon={X} size={16} />
              </View>
            </TouchableOpacity>
          ))}
          <View className="w-1/3 p-1">
            <Button className="h-[100px]" variant="secondary" onPress={onPickImage}>
              <Icon icon={Plus} />
            </Button>
          </View>
        </View>
      </ScrollView>

      {images.length > 0 && (
        <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
          <Button
            size="sm"
            onPress={() => {
              const searchParams = new URLSearchParams({ ...params, images: images.join(",") })
              router.push(`/${tab}/spot/${id}/edit/confirm?${searchParams}`)
            }}
          >
            Next
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
