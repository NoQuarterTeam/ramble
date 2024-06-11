import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Heart, Plus, X } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

import type { SpotType } from "@ramble/database/types"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"

import { isCampingSpot } from "@ramble/shared"
import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotImagesScreen() {
  const params = useLocalSearchParams<{ type: SpotType }>()
  const router = useRouter()
  const [images, setImages] = React.useState<string[]>([])

  const [coverIndex, setCoverIndex] = React.useState(0)
  const onPickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      })
      if (result.canceled || result.assets.length === 0) return
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
        <Text className="pb-2">Click the image you want to have as the cover</Text>
        <View className="flex flex-row flex-wrap">
          {images.map((image, i) => (
            <View key={image} className="relative w-1/3 p-1">
              <TouchableOpacity activeOpacity={0.8} onPress={() => setCoverIndex(i)}>
                <Image className="h-[100px] w-full rounded-xs bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
              </TouchableOpacity>
              {coverIndex === i && (
                <View className="absolute bottom-2 left-2 rounded-full bg-gray-100 p-1.5 dark:bg-gray-900">
                  <Icon icon={Heart} size={14} />
                </View>
              )}
              <TouchableOpacity
                onPress={() => setImages((im) => im.filter((i) => i !== image))}
                className="-right-1 -top-1 absolute rounded-full bg-gray-100 p-1 dark:bg-gray-900"
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
          className="rounded-full"
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
