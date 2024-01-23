import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { Plus, X } from "lucide-react-native"

import { Icon } from "../../../../components/Icon"
import { Button } from "../../../../components/ui/Button"
import { toast } from "../../../../components/ui/Toast"
import { useParams, useRouter } from "../../../router"
import { NewSpotModalView } from "./NewSpotModalView"

export function NewSpotImagesScreen() {
  const { params } = useParams<"NewSpotImagesScreen">()
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
      console.log(error)
      let message
      if (error instanceof Error) message = error.message
      else message = String(error)
      toast({ title: "Error selecting image", message, type: "error" })
    }
  }

  const router = useRouter()
  return (
    <NewSpotModalView title="upload images">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-row flex-wrap">
          {images.map((image) => (
            <TouchableOpacity key={image} onPress={() => setImages((im) => im.filter((i) => i !== image))} className="w-1/3 p-1">
              <Image className="rounded-xs h-[100px] w-full bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
              <View className="absolute -right-1 -top-1 rounded-full bg-gray-100 p-1 dark:bg-gray-900">
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

      <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
        <Button className="rounded-full" onPress={() => router.push("NewSpotConfirmScreen", { ...params, images })}>
          Next
        </Button>
      </View>
    </NewSpotModalView>
  )
}
