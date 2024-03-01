import { createImageUrl } from "@ramble/shared"
import { FlashList } from "@shopify/flash-list"
import dayjs from "dayjs"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import { Link, useLocalSearchParams } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import { MapPinOff } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, Alert, Linking, TouchableOpacity, View } from "react-native"
import * as DropdownMenu from "zeego/dropdown-menu"
import { Icon } from "~/components/Icon"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { width } from "~/lib/device"
import { useS3QuickUpload } from "~/lib/hooks/useS3"

const size = width / 3

export default function TripImages() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, refetch, isLoading } = api.trip.media.all.useQuery({ tripId: id, skip: 0 })

  const [images, setImages] = React.useState(data)

  React.useEffect(() => {
    setImages(data)
  }, [data])

  const utils = api.useUtils()

  // biome-ignore lint/correctness/useExhaustiveDependencies: allow dat
  const handleLoadMore = React.useCallback(async () => {
    try {
      const newImages = await utils.trip.media.all.fetch({ tripId: id, skip: images?.length || 0 })
      setImages([...(images || []), ...newImages])
    } catch {
      toast({ title: "Failed to load more images", type: "error" })
    }
  }, [images, id])

  const upload = useS3QuickUpload()

  const { mutate: uploadMedia } = api.trip.media.upload.useMutation({
    onSuccess: (timestamp) => {
      utils.trip.detail.setData({ id }, (prev) => (prev ? { ...prev, latestMediaTimestamp: timestamp } : prev))
    },
  })
  const [_status, requestPermission] = ImagePicker.useCameraPermissions()

  const [isUploading, setIsUploading] = React.useState(false)
  const handleOpenImageLibrary = async () => {
    const perm = await requestPermission()
    if (!perm.granted) {
      return Alert.alert(
        "Camera permissions required",
        "Please go to your phone's settings to grant camera permissions for Ramble",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open settings", onPress: Linking.openSettings },
        ],
      )
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 0,
        quality: 0.2,
      })
      if (result.canceled || result.assets.length === 0) return

      setIsUploading(true)
      for (const asset of result.assets) {
        if (!asset.assetId) continue
        const info = await MediaLibrary.getAssetInfoAsync(asset.assetId)
        const image = {
          ...asset,
          id: info.id,
          creationTime: info.creationTime,
          url: info.localUri || asset.uri,
          latitude: info.location?.latitude,
          longitude: info.location?.longitude,
        }
        const key = await upload(image.url)
        const payload = {
          path: key,
          url: image.url,
          latitude: image.latitude || null,
          longitude: image.longitude || null,
          assetId: image.id,
          timestamp: dayjs(image.creationTime).toDate(),
        }
        uploadMedia({ tripId: id, image: payload })
      }
      refetch()
    } catch (error) {
      console.log(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleOpenCamera = async () => {
    await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      exif: true,
    })
  }

  return (
    <ScreenView
      title=""
      containerClassName="px-0"
      rightElement={
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <TouchableOpacity
              className="sq-10 bg-background dark:bg-background-dark flex items-center justify-center rounded-full"
              activeOpacity={0.8}
            >
              <Icon icon={PlusCircle} size={24} color="primary" />
            </TouchableOpacity>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item key="camera" onSelect={handleOpenCamera}>
              Camera
            </DropdownMenu.Item>
            <DropdownMenu.Item key="library" onSelect={handleOpenImageLibrary}>
              Photo Library
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      }
    >
      {isLoading ? (
        <View className="p-4 flex items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <View className="flex-1 relative">
          <FlashList
            showsVerticalScrollIndicator={false}
            estimatedItemSize={size}
            onEndReached={handleLoadMore}
            numColumns={3}
            ListEmptyComponent={<Text className="text-center">No images yet</Text>}
            data={images}
            renderItem={({ item }) => (
              <Link href={`/(home)/(trips)/trips/${id}/images/${item.id}`} asChild>
                <TouchableOpacity style={{ width: size, height: size }} className="relative">
                  <Image className="bg-gray-200 dark:bg-gray-700 w-full h-full" source={{ uri: createImageUrl(item.path) }} />
                  {(!item.latitude || !item.longitude) && (
                    <View className="absolute bottom-1 left-1 flex items-center justify-center bg-background sq-6 rounded-full dark:bg-background-dark">
                      <Icon icon={MapPinOff} size={16} />
                    </View>
                  )}
                </TouchableOpacity>
              </Link>
            )}
          />
          {isUploading && (
            <View className="absolute top-2 left-0 right-0 flex items-center justify-center">
              <View className="flex items-center bg-primary px-4 py-2 rounded-full flex-row space-x-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white">Uploading</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </ScreenView>
  )
}
