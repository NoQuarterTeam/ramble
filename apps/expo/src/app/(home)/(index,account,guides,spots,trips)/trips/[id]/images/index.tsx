import { createImageUrl } from "@ramble/shared"
import dayjs from "dayjs"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import * as MediaLibrary from "expo-media-library"
import { Link, useLocalSearchParams } from "expo-router"
import { PlusCircle } from "lucide-react-native"
import * as React from "react"
import { Alert, Linking, ScrollView, TouchableOpacity, View } from "react-native"
import * as DropdownMenu from "zeego/dropdown-menu"
import { Icon } from "~/components/Icon"
import { ScreenView } from "~/components/ui/ScreenView"
import { api } from "~/lib/api"
import { width } from "~/lib/device"
import { useS3QuickUpload } from "~/lib/hooks/useS3"

const size = (width - 16) / 3

export default function TripImages() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, refetch } = api.trip.media.all.useQuery({ tripId: id })

  const utils = api.useUtils()
  const upload = useS3QuickUpload()
  const { mutate: uploadMedia } = api.trip.media.upload.useMutation({
    onSuccess: (timestamp) => {
      utils.trip.detail.setData({ id }, (prev) => (prev ? { ...prev, latestMediaTimestamp: timestamp } : prev))
    },
  })
  const [status, requestPermission] = ImagePicker.useCameraPermissions()

  React.useEffect(() => {
    if (!status || status?.granted) return
    if (status?.canAskAgain) {
      requestPermission().catch()
    } else {
      Alert.alert("Camera permissions required", "Please go to your phone's settings to grant camera permissions for Ramble", [
        { text: "Cancel", style: "cancel" },
        { text: "Open settings", onPress: Linking.openSettings },
      ])
    }
  }, [status, requestPermission])

  const handleOpenImageLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      selectionLimit: 0,
      quality: 0.2,
    })
    if (result.canceled || result.assets.length === 0) return
    const images = []
    for (const asset of result.assets) {
      try {
        if (!asset.assetId) continue
        const info = await MediaLibrary.getAssetInfoAsync(asset.assetId)
        const imageWithData = {
          ...asset,
          id: info.id,
          creationTime: info.creationTime,
          url: info.localUri || asset.uri,
          latitude: info.location?.latitude,
          longitude: info.location?.longitude,
        }
        images.push(imageWithData)
      } catch (error) {
        console.log(error)
      }
    }
    if (images.length === 0) return
    for (const image of images) {
      try {
        const key = await upload(image.url)
        const payload = {
          path: key,
          url: image.url,
          latitude: image.latitude || null,
          longitude: image.longitude || null,
          assetId: image.id,
          timestamp: dayjs(image.creationTime).toDate(),
        }
        console.log("(----------IS THIS HAPPENING MULTIPLE TIMESS???? ------------")

        uploadMedia({ tripId: id, image: payload })
      } catch (error) {
        console.log(error)
      }
    }
    refetch()
  }

  const handleOpenCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      exif: true,
    })
    console.log(result)
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
      <ScrollView className="flex-1 pt-2">
        <View className="flex flex-wrap flex-row gap-1">
          {data?.map((image) => (
            <Link key={image.id} href={`/(home)/(trips)/trips/${id}/images/${image.id}`} asChild>
              <TouchableOpacity>
                <Image
                  className="bg-gray-200 dark:bg-gray-700"
                  source={{ uri: createImageUrl(image.path) }}
                  style={{ width: size, height: size }}
                />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </ScreenView>
  )
}
