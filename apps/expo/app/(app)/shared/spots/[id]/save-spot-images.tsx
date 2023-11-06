import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { Plus, X } from "lucide-react-native"

import { Icon } from "../../../../../components/Icon"
import { Button } from "../../../../../components/ui/Button"
import { ModalView } from "../../../../../components/ui/ModalView"
import { toast } from "../../../../../components/ui/Toast"
import { api } from "../../../../../lib/api"
import { useS3Upload } from "../../../../../lib/hooks/useS3"
import { useParams, useRouter } from "../../../../router"

export function SaveSpotImagesScreen() {
  const { goBack } = useRouter()
  const { params } = useParams<"SaveSpotImagesScreen">()
  const [isLoading, setIsLoading] = React.useState(false)
  const [images, setImages] = React.useState(params.images)
  const [upload] = useS3Upload()
  const utils = api.useUtils()
  const { mutate, isLoading: mutationLoading } = api.spot.addImages.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.spot.mapPreview.refetch({ id: params.id }), utils.spot.detail.refetch({ id: params.id })])
      toast({ title: "Images added!" })
      goBack()
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleUpload = async () => {
    setIsLoading(true)
    const imagePaths = (await Promise.all(params.images.map((i) => upload(i)))).map((i) => ({ path: i }))
    mutate({ id: params.id, images: imagePaths })
  }

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

  return (
    <ModalView title="upload images">
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

      {images.length > 0 && (
        <View className="absolute bottom-12 left-4 right-4 flex items-center justify-center space-y-2">
          <Button isLoading={isLoading || mutationLoading} className="rounded-full" onPress={handleUpload}>
            Confirm
          </Button>
        </View>
      )}
    </ModalView>
  )
}
