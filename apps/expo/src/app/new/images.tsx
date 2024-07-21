import * as FileSystem from "expo-file-system"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Plus, Star, X } from "lucide-react-native"
import * as React from "react"
import { Platform, ScrollView, TouchableOpacity, View } from "react-native"

import type { SpotType } from "@ramble/database/types"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"

import { isCampingSpot, merge } from "@ramble/shared"
import { type FileInfo, TEN_MB } from "~/lib/fileSystem"
import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotImagesScreen() {
  const params = useLocalSearchParams<{ type: SpotType }>()
  const router = useRouter()
  const [images, setImages] = React.useState<string[]>([])

  const [coverIndex, setCoverIndex] = React.useState(0)
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
      let message: string
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  return (
    <NewSpotModalView title="upload images" shouldRenderToast>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {isCampingSpot(params.type) && (
          <Text className="pb-2">Try and add a photo of your van at the spot, maybe a nice picture of the view!</Text>
        )}
        {images.length > 0 && <Text className="pb-2 opacity-70">Click the image you want to have as the cover</Text>}
        <View className="flex flex-row flex-wrap">
          {images.map((image, i) => (
            <View key={image} className="relative w-1/3 p-1">
              <TouchableOpacity activeOpacity={0.8} onPress={() => setCoverIndex(i)}>
                <Image
                  className={merge(
                    coverIndex === i && "border-2 border-primary-500",
                    "h-[100px] w-full rounded-xs bg-gray-50 object-cover dark:bg-gray-700",
                  )}
                  source={{ uri: image }}
                />
              </TouchableOpacity>
              {coverIndex === i && (
                <View className="absolute bottom-2 left-2 rounded-sm bg-primary-500 px-1 flex-row space-x-0.5 items-center pb-0.5">
                  <Icon icon={Star} size={11} color="white" className="mt-0.5" />
                  <Text className="text-white">cover</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setImages((im) => im.filter((i) => i !== image))}
                className="right-0 top-0 absolute rounded-full bg-gray-100 p-1 dark:bg-gray-900"
              >
                <Icon icon={X} size={16} />
              </TouchableOpacity>
            </View>
          ))}
          <View className="w-1/3 p-1">
            <Button className="h-[100px]" variant="secondary" onPress={onPickImage}>
              <Icon icon={Plus} />
            </Button>
          </View>
        </View>
      </ScrollView>

      <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
        <Button
          size="sm"
          onPress={() => {
            if (images.length === 0) return toast({ title: "Please add at least one image" })
            const searchParams = new URLSearchParams({ ...params, coverIndex: coverIndex.toString(), images: images.join(",") })
            // @ts-ignore
            router.push(`/new/confirm?${searchParams}`)
          }}
        >
          Next
        </Button>
      </View>
    </NewSpotModalView>
  )
}
