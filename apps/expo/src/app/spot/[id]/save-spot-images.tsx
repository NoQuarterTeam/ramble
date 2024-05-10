import * as Sentry from "@sentry/react-native"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Plus, X } from "lucide-react-native"
import * as React from "react"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { ModalView } from "~/components/ui/ModalView"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { useS3Upload } from "~/lib/hooks/useS3"

export default function SaveSpotImagesScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string; images?: string }>()
  const [isLoading, setIsLoading] = React.useState(false)
  const [images, setImages] = React.useState(params.images?.split(",") || [])
  const [upload] = useS3Upload()
  const utils = api.useUtils()
  const { mutate, isPending: mutationLoading } = api.spot.addImages.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.spot.mapPreview.refetch({ id: params.id }), utils.spot.detail.refetch({ id: params.id })])
      router.back()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({ title: "Images added!" })
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const handleUpload = async () => {
    setIsLoading(true)
    const imagePaths = (await Promise.all(images.map((i) => upload(i)))).map((i) => ({ path: i }))
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
      Sentry.captureException(error)
      let message: string
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

      {images.length > 0 && (
        <View className="absolute right-4 bottom-12 left-4 flex items-center justify-center space-y-2">
          <Button isLoading={isLoading || mutationLoading} className="rounded-full" onPress={handleUpload}>
            Confirm
          </Button>
        </View>
      )}
    </ModalView>
  )
}
