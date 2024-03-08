import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Plus, X } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"

import type { SpotType } from "@ramble/database/types"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"

import { NewSpotModalView } from "./NewSpotModalView"

export default function NewSpotImagesScreen() {
  const params = useLocalSearchParams<{ type: SpotType }>()
  const router = useRouter()
  const [images, setImages] = React.useState<string[]>([])

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
    <NewSpotModalView title="upload images">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {(params.type === "CAMPING" || params.type === "FREE_CAMPING") && (
          <Text>Try and add a photo of your van at the spot, maybe a nice picture of the view!</Text>
        )}
        <View className="flex flex-row flex-wrap">
          {images.map((image) => (
            <TouchableOpacity key={image} onPress={() => setImages((im) => im.filter((i) => i !== image))} className="w-1/3 p-1">
              <Image className="h-[100px] w-full rounded-xs bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
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

      <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
        <Button
          className="rounded-full"
          onPress={() => {
            const searchParams = new URLSearchParams({ ...params, images: images.join(",") })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
