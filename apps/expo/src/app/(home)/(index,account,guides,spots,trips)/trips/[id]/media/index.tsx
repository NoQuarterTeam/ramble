import type { MediaType } from "@ramble/database/types"
import { createAssetUrl, useDisclosure } from "@ramble/shared"
import { Camera, LocationPuck, type MapState, type MapView as MapType, StyleURL } from "@rnmapbox/maps"
import type { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position"
import * as Sentry from "@sentry/react-native"
import { FlashList } from "@shopify/flash-list"
import dayjs from "dayjs"
import { Image } from "expo-image"
import * as ImagePicker from "expo-image-picker"
import * as Location from "expo-location"
import * as MediaLibrary from "expo-media-library"
import { useLocalSearchParams, useRouter } from "expo-router"
import * as VideoThumbnails from "expo-video-thumbnails"
import { Check, CircleDot, ImageOff, MapPin, MapPinOff, Navigation, PlusCircle, Trash } from "lucide-react-native"
import * as React from "react"
import { ActivityIndicator, Alert, Linking, Modal, TouchableOpacity, View } from "react-native"

import { Icon } from "~/components/Icon"
import { MapView } from "~/components/Map"
import { Button } from "~/components/ui/Button"
import { IconButton } from "~/components/ui/IconButton"
import { Input } from "~/components/ui/Input"
import { ModalView } from "~/components/ui/ModalView"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { type RouterOutputs, api } from "~/lib/api"
import { width } from "~/lib/device"
import { useMapCoords } from "~/lib/hooks/useMapCoords"
import { useS3QuickUpload } from "~/lib/hooks/useS3"
import { formatVideoDuration } from "~/lib/utils"

const size = width / 3

export default function TripMedia() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data, refetch, isLoading } = api.trip.media.all.useQuery({ tripId: id, skip: 0 })
  const total = data?.total || 0
  const [media, setMedia] = React.useState(data?.items || [])

  React.useEffect(() => {
    setMedia(data?.items || [])
  }, [data?.items])

  const utils = api.useUtils()

  const [isRefetching, setIsRefetching] = React.useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: naa
  const handleLoadMore = React.useCallback(async () => {
    if (isRefetching || total === media.length) return
    try {
      setIsRefetching(true)
      const newMedia = await utils.trip.media.all.fetch({ tripId: id, skip: media?.length || 0 })
      setMedia([...(media || []), ...newMedia.items])
    } catch {
      toast({ title: "Failed to load more", type: "error" })
    } finally {
      setIsRefetching(false)
    }
  }, [isRefetching, media, id, total])

  const upload = useS3QuickUpload()

  const { mutate: uploadMedia } = api.trip.media.upload.useMutation({
    onSuccess: (timestamp) => {
      utils.trip.detail.setData({ id }, (prev) => (prev ? { ...prev, latestMediaTimestamp: timestamp } : prev))
      refetch()
    },
  })

  const [isUploading, setIsUploading] = React.useState(false)
  const [isLoadingLibrary, setIsLoadingLibrary] = React.useState(false)

  const [_mediaStatus, requestMediaLibrary] = ImagePicker.useMediaLibraryPermissions()
  const handleOpenImageLibrary = async () => {
    try {
      setIsLoadingLibrary(true)
      const perm = await requestMediaLibrary()
      if (!perm.granted) {
        setIsLoadingLibrary(false)
        return Alert.alert(
          "Media library permissions required",
          "Please go to your phone's settings to grant media library permissions for Ramble",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open settings", onPress: Linking.openSettings },
          ],
        )
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: 40,
        quality: 0.5,
      })
      setIsLoadingLibrary(false)
      if (result.canceled || result.assets.length === 0) return

      setIsUploading(true)

      for (const asset of result.assets) {
        if (!asset.assetId) continue // ??
        const info = await MediaLibrary.getAssetInfoAsync(asset.assetId)
        if (info.mediaType !== MediaLibrary.MediaType.photo && info.mediaType !== MediaLibrary.MediaType.video)
          return toast({ title: "Please upload an image or a video", type: "error" })
        const type = info.mediaType === MediaLibrary.MediaType.photo ? "IMAGE" : "VIDEO"
        const media = {
          assetId: info.id,
          timestamp: dayjs(info.creationTime).toDate(),
          url: info.localUri || asset.uri,
          latitude: info.location?.latitude || null,
          longitude: info.location?.longitude || null,
          type: type as MediaType,
          duration: info.duration || null,
        }
        let thumbnailPath = null
        if (type === "VIDEO") {
          const { uri } = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 0 })
          thumbnailPath = await upload(uri)
        }
        const path = await upload(media.url)
        const data = { path, thumbnailPath, ...media }
        uploadMedia({ tripId: id, media: data })
      }
    } catch (error) {
      Sentry.captureException(error)
      toast({ title: "Error syncing media", type: "error" })
      refetch()
    } finally {
      setIsLoadingLibrary(false)
      setIsUploading(false)
    }
  }

  const selectProps = useDisclosure()
  const setMapProps = useDisclosure()
  const [selectedMedia, setSelectedMedia] = React.useState<RouterOutputs["trip"]["media"]["all"]["items"]>([])
  const router = useRouter()
  const isSelectedWithLocation = selectedMedia.some((i) => i.latitude && i.longitude)

  const { mutate } = api.trip.media.deleteMany.useMutation({
    onSuccess: () => {
      refetch()
      void utils.trip.detail.refetch({ id })
      setSelectedMedia([])
      selectProps.onToggle()
    },
  })

  const handleDeleteMany = () => {
    Alert.alert("Are you sure?", "This can't be undone", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => mutate(selectedMedia.map((i) => i.id)) },
    ])
  }

  return (
    <ScreenView
      containerClassName="px-0"
      rightElement={
        <View className="flex flex-row items-center space-x-3">
          {media.length > 0 && (
            <Button
              onPress={() => {
                selectProps.onToggle()
                if (selectProps.isOpen) setSelectedMedia([])
              }}
              size="xs"
              variant="secondary"
              className="rounded-full px-4"
            >
              {selectProps.isOpen ? "Cancel" : "Select"}
            </Button>
          )}

          {!selectProps.isOpen && (
            <TouchableOpacity onPress={handleOpenImageLibrary} activeOpacity={0.8} className="w-[24px]">
              {isLoadingLibrary ? <Spinner /> : <Icon icon={PlusCircle} />}
            </TouchableOpacity>
          )}
        </View>
      }
    >
      {isLoading ? (
        <View className="flex items-center justify-center p-4">
          <ActivityIndicator />
        </View>
      ) : !media ? null : (
        <View className="relative flex-1">
          <FlashList
            showsVerticalScrollIndicator={false}
            estimatedItemSize={size}
            onEndReached={handleLoadMore}
            ListFooterComponent={<View style={{ height: selectProps.isOpen ? 50 : 0 }} />}
            onEndReachedThreshold={0.5}
            numColumns={3}
            ListEmptyComponent={<Text className="text-center">Nothing here yet</Text>}
            data={media}
            extraData={{ isOpen: selectProps.isOpen, selectedMedia }}
            renderItem={({ item }) => (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{ width: size, height: size }}
                  className="relative"
                  onPress={() => {
                    if (selectProps.isOpen) {
                      setSelectedMedia((s) =>
                        s.find((i) => i.id === item.id) ? s.filter((i) => i.id !== item.id) : [...s, item],
                      )
                    } else {
                      return router.push(`/(home)/(trips)/trips/${id}/media/${item.id}`)
                    }
                  }}
                >
                  {item.type === "VIDEO" ? (
                    <View className="w-full h-full flex items-center justify-center">
                      {item.thumbnailPath ? (
                        <Image
                          className="h-full w-full bg-gray-200 dark:bg-gray-700"
                          source={{ uri: createAssetUrl(item.thumbnailPath) }}
                        />
                      ) : (
                        <View className="flex space-y-1 px-4 items-center">
                          <Icon icon={ImageOff} />
                          <Text className="text-xs text-center">Preview unavailable</Text>
                        </View>
                      )}
                      {item.duration && (
                        <Text className="absolute bottom-1 text-white text-xs right-1 font-700">
                          {formatVideoDuration(item.duration)}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Image className="h-full w-full bg-gray-200 dark:bg-gray-700" source={{ uri: createAssetUrl(item.path) }} />
                  )}
                  {(!item.latitude || !item.longitude) && (
                    <View className="sq-6 absolute bottom-1 left-1 flex items-center justify-center rounded-full bg-background dark:bg-background-dark">
                      <Icon icon={MapPinOff} size={16} />
                    </View>
                  )}
                  {selectProps.isOpen && selectedMedia.find((i) => i.id === item.id) && (
                    <View className="sq-5 absolute right-1 top-1 flex items-center justify-center rounded-full bg-blue-500">
                      <Icon icon={Check} size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          />
          {isUploading && (
            <View className="absolute top-2 right-0 left-0 flex items-center justify-center">
              <View className="flex flex-row items-center space-x-2 rounded-full bg-primary px-4 py-2">
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white">Uploading</Text>
              </View>
            </View>
          )}
          {selectProps.isOpen && (
            <View className="absolute right-0 bottom-0 left-0 flex h-12 flex-row items-center justify-between bg-background px-4 dark:bg-background-dark border-t border-gray-100 dark:border-gray-800">
              {selectedMedia.length > 0 ? <Text>{selectedMedia.length} selected</Text> : <Text>Select images</Text>}
              <View className="flex flex-row items-center justify-end space-x-3">
                {!isSelectedWithLocation && (
                  <>
                    <IconButton onPress={setMapProps.onOpen} size="xs" disabled={selectedMedia.length === 0} icon={MapPin} />
                    <Modal
                      animationType="slide"
                      presentationStyle="formSheet"
                      visible={setMapProps.isOpen}
                      onRequestClose={setMapProps.onClose}
                      onDismiss={setMapProps.onClose}
                    >
                      <AddMediaLocation
                        ids={selectedMedia.map((i) => i.id)}
                        onClose={setMapProps.onClose}
                        onSave={() => {
                          refetch()
                          setMapProps.onClose()
                          for (const { id } of selectedMedia) {
                            void utils.trip.media.byId.invalidate({ id })
                          }
                          setSelectedMedia([])
                          selectProps.onClose()
                          void utils.trip.detail.refetch({ id })
                        }}
                      />
                    </Modal>
                  </>
                )}

                <IconButton
                  onPress={handleDeleteMany}
                  size="xs"
                  variant="ghost"
                  icon={Trash}
                  disabled={selectedMedia.length === 0}
                />
              </View>
            </View>
          )}
        </View>
      )}
    </ScreenView>
  )
}

function AddMediaLocation({ ids, onClose, onSave }: { ids: string[]; onClose: () => void; onSave: () => void }) {
  const { id } = useLocalSearchParams<{ id: string }>()

  const initialCoords = useMapCoords((s) => s.coords)
  const [coords, setCoords] = React.useState<Position | undefined>(initialCoords)

  const [search, setSearch] = React.useState("")

  const camera = React.useRef<Camera>(null)
  const mapRef = React.useRef<MapType>(null)

  const { data: places } = api.mapbox.getPlaces.useQuery({ search }, { enabled: !!search, keepPreviousData: true })

  const handleSetUserLocation = async () => {
    try {
      const loc = await Location.getLastKnownPositionAsync()
      if (!loc) return
      camera.current?.setCamera({
        zoomLevel: 9,
        animationDuration: 0,
        animationMode: "none",
        centerCoordinate: [loc.coords.longitude, loc.coords.latitude],
      })
    } catch {
      console.log("oops -  setting location")
    }
  }

  const onMapMove = ({ properties }: MapState) => {
    if (!properties.bounds) return
    setCoords(properties.center)
  }

  const { mutate, isLoading: saveLoading } = api.trip.media.updateMany.useMutation({
    onSuccess: () => {
      if (!coords) return

      onSave()
    },
  })

  const handleSelectLocation = () => {
    if (!coords) return toast({ title: "Please select a location" })
    mutate({
      tripId: id,
      ids,
      data: { longitude: coords[0]!, latitude: coords[1]! },
    })
  }

  return (
    <ModalView edges={["top", "bottom"]} title="choose a location" onBack={onClose}>
      <View className="relative flex-1">
        <MapView
          className="overflow-hidden rounded-xs"
          onMapIdle={onMapMove}
          ref={mapRef}
          styleURL={StyleURL.SatelliteStreet}
          compassPosition={{ top: 54, right: 8 }}
        >
          <LocationPuck />

          <Camera
            ref={camera}
            allowUpdates
            followUserLocation={false}
            defaultSettings={{
              centerCoordinate: [initialCoords[0], initialCoords[1]],
              zoomLevel: 5,
              pitch: 0,
              heading: 0,
            }}
          />
        </MapView>
        <View className="absolute top-2 right-2 left-2">
          <Input
            className="rounded-sm bg-background dark:bg-background-dark"
            placeholder="Search here"
            onChangeText={setSearch}
            value={search}
            clearButtonMode="while-editing"
            returnKeyType="done"
          />
          {search && places && (
            <View className="rounded-b-sm bg-background p-2 dark:bg-background-dark">
              {places.map((place, i) => (
                <TouchableOpacity
                  key={`${place.name}-${i}`}
                  className="p-2"
                  onPress={() => {
                    setSearch("")
                    setCoords(place.center)
                    camera.current?.setCamera({
                      zoomLevel: 9,
                      animationDuration: 1000,
                      animationMode: "flyTo",
                      centerCoordinate: place.center,
                    })
                  }}
                >
                  <Text numberOfLines={1}>{place.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View
          style={{ transform: [{ translateX: -15 }, { translateY: -15 }] }}
          className="absolute top-1/2 left-1/2 flex items-center justify-center"
        >
          <Icon icon={CircleDot} size={30} color="white" />
        </View>

        <View
          pointerEvents="box-none"
          className="absolute right-5 bottom-5 left-5 flex flex-row items-center justify-between space-y-2"
        >
          <View className="w-12" />
          <Button
            className="rounded-full bg-background"
            textClassName="text-black"
            onPress={handleSelectLocation}
            isLoading={saveLoading}
            disabled={!coords || (coords && (!coords[0] || !coords[1])) || saveLoading}
          >
            Save
          </Button>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSetUserLocation}
            className="sq-12 flex flex-row items-center justify-center rounded-full bg-background"
          >
            <Navigation size={20} className="text-black" />
          </TouchableOpacity>
        </View>
      </View>
    </ModalView>
  )
}
