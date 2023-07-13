import * as React from "react"
import { ScreenView } from "../../../components/ui/ScreenView"
import * as ImagePicker from "expo-image-picker"

import { ScrollView, TouchableOpacity, View } from "react-native"
import { Button } from "../../../components/ui/Button"
import { useParams, useRouter } from "../../router"
import { toast } from "../../../components/ui/Toast"
import { Image } from "expo-image"
import { Plus, X } from "lucide-react-native"

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
      setImages(result.assets.map((asset) => asset.uri))
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
    <ScreenView
      title="Upload images"
      rightElement={
        images.length > 0 && (
          <Button size="sm" variant="link" onPress={() => router.push("NewSpotConfirmScreen", { ...params, images })}>
            Next
          </Button>
        )
      }
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-row flex-wrap">
          {images.map((image) => (
            <TouchableOpacity key={image} onPress={() => setImages((im) => im.filter((i) => i !== image))} className="w-1/3 p-1">
              <Image className="h-[100px] w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700" source={{ uri: image }} />
              <View className="absolute -right-1 -top-1 rounded-full bg-gray-100 p-1 dark:bg-gray-900">
                <X className="text-gray-800 dark:text-white" size={16} />
              </View>
            </TouchableOpacity>
          ))}
          <View className="w-1/3 p-1">
            <Button className="h-[100px]" variant="secondary" onPress={onPickImage}>
              <Plus className="text-black dark:text-white" />
            </Button>
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-4 left-4 flex flex-row right-4 items-center justify-center">
        <Button
          variant="secondary"
          leftIcon={<X size={20} className="text-black dark:text-white" />}
          className="rounded-full"
          size="sm"
          onPress={router.popToTop}
        >
          Cancel
        </Button>
      </View>
    </ScreenView>
  )
}
