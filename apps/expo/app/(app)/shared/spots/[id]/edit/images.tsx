import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { Plus, X } from "lucide-react-native"

import { createImageUrl } from "@ramble/shared"

import { Button } from "../../../../../../components/ui/Button"
import { toast } from "../../../../../../components/ui/Toast"
import { useParams, useRouter } from "../../../../../router"
import { EditSpotModalView } from "./EditSpotModalView"

export function EditSpotImagesScreen() {
  const { params } = useParams<"EditSpotImagesScreen">()
  const [images, setImages] = React.useState<string[]>(params.images)

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
    <EditSpotModalView title="Upload images">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex flex-row flex-wrap">
          {images.map((image) => (
            <TouchableOpacity key={image} onPress={() => setImages((im) => im.filter((i) => i !== image))} className="w-1/3 p-1">
              <Image
                className="h-[100px] w-full rounded-md bg-gray-50 object-cover dark:bg-gray-700"
                source={{ uri: image.startsWith("file://") ? image : createImageUrl(image) }}
              />
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

      {images.length > 0 && (
        <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
          <Button className="rounded-full" onPress={() => router.push("EditSpotConfirmScreen", { ...params, images })}>
            Next
          </Button>
        </View>
      )}
    </EditSpotModalView>
  )
}
