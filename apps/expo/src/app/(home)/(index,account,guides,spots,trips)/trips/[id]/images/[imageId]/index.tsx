import dayjs from "dayjs"
import { ResizeMode, Video } from "expo-av"
import type { AVPlaybackStatus } from "expo-av"
import * as FileSystem from "expo-file-system"
import { Image } from "expo-image"
import * as MediaLibrary from "expo-media-library"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { Download, MapPin, Play, Trash } from "lucide-react-native"
import * as React from "react"
import { Alert, type LayoutChangeEvent, TouchableOpacity, View } from "react-native"
import { Gesture, GestureDetector, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { createImageUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { height, width } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

const clamp = (value: number, min: number, max: number): number => {
  "worklet"
  return Math.min(Math.max(min, value), max)
}

const DOUBLE_ZOOM = 3

export default function TripImage() {
  const { me } = useMe()
  const { id, imageId, bounds } = useLocalSearchParams<{ id: string; imageId?: string; bounds?: string }>()

  const video = React.useRef(null) // TODO types
  const [status, setStatus] = React.useState<AVPlaybackStatus | undefined>()

  const parsedBounds = bounds?.split(",").map(Number)

  const { data, isLoading } = api.trip.media.byId.useQuery(
    { id: imageId! },
    { enabled: !!imageId, staleTime: Number.POSITIVE_INFINITY, cacheTime: Number.POSITIVE_INFINITY },
  )

  const router = useRouter()

  const utils = api.useUtils()
  const { mutate, isLoading: removeLoading } = api.trip.media.remove.useMutation({
    onSuccess: () => {
      if (!imageId) return
      void utils.trip.detail.refetch({ id })
      if (parsedBounds) {
        utils.trip.media.byBounds.setData({ tripId: id, skip: 0, bounds: parsedBounds }, (prev) =>
          prev ? { total: prev.total - 1, items: prev.items.filter((media) => media.id !== imageId) } : prev,
        )
      } else {
        utils.trip.media.all.setData({ tripId: id, skip: 0 }, (prev) =>
          prev ? { total: prev.total - 1, items: prev.items.filter((media) => media.id !== imageId) } : prev,
        )
      }
      router.back()
    },
    onError: () => {
      toast({ title: "Failed to remove image", type: "error" })
    },
  })

  const handleRemove = async () => {
    if (!imageId) return
    Alert.alert("Are you sure?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => mutate({ id: imageId }) },
    ])
  }

  const handleDownload = async () => {
    try {
      if (!data) return
      const file = await FileSystem.downloadAsync(createImageUrl(data.path), FileSystem.documentDirectory + data.path)
      await MediaLibrary.saveToLibraryAsync(file.uri)
    } catch (error) {
      console.log(error)
      toast({ title: "Failed to download image", type: "error" })
    }
  }

  const centerX = useSharedValue(0)
  const centerY = useSharedValue(0)
  const onImageLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout
    centerX.value = x + width / 2
    centerY.value = y + height / 2
  }

  const prevScale = useSharedValue(1)
  const scale = useSharedValue(1)
  const initialFocal = { x: useSharedValue(0), y: useSharedValue(0) }
  const prevFocal = { x: useSharedValue(0), y: useSharedValue(0) }
  const focal = { x: useSharedValue(0), y: useSharedValue(0) }
  const prevTranslate = { x: useSharedValue(0), y: useSharedValue(0) }
  const translate = { x: useSharedValue(0), y: useSharedValue(0) }

  const isActive = useSharedValue(false)
  const moveIntoView = () => {
    "worklet"
    if (scale.value > 1) {
      const rightLimit = (width * (scale.value - 1)) / 2
      const leftLimit = -rightLimit
      const totalTranslateX = translate.x.value + focal.x.value

      const bottomLimit = (height * (scale.value - 1)) / 2
      const topLimit = -bottomLimit
      const totalTranslateY = translate.y.value + focal.y.value

      if (totalTranslateX > rightLimit) {
        translate.x.value = withTiming(rightLimit)
        focal.x.value = withTiming(0)
      } else if (totalTranslateX < leftLimit) {
        translate.x.value = withTiming(leftLimit)
        focal.x.value = withTiming(0)
      }

      if (totalTranslateY > bottomLimit) {
        translate.y.value = withTiming(bottomLimit)
        focal.y.value = withTiming(0)
      } else if (totalTranslateY < topLimit) {
        translate.y.value = withTiming(topLimit)
        focal.y.value = withTiming(0)
      }
    } else {
      scale.value = withTiming(1, undefined, () => {
        isActive.value = false
      })
      translate.x.value = withTiming(0)
      focal.x.value = withTiming(0)
      translate.y.value = withTiming(0)
      focal.y.value = withTiming(0)
    }
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = true
      prevTranslate.x.value = translate.x.value
      prevTranslate.y.value = translate.y.value
    })
    .onUpdate((event) => {
      translate.x.value = prevTranslate.x.value + event.translationX
      translate.y.value = prevTranslate.y.value + event.translationY
    })
    .onEnd(() => {
      moveIntoView()
    })

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      isActive.value = true
      prevScale.value = scale.value
      prevFocal.x.value = focal.x.value
      prevFocal.y.value = focal.y.value
      initialFocal.x.value = event.focalX
      initialFocal.y.value = event.focalY
    })
    .onUpdate((event) => {
      scale.value = clamp(prevScale.value * event.scale, 0.05, 10)
      focal.x.value = prevFocal.x.value + (centerX.value - initialFocal.x.value) * (scale.value - prevScale.value)
      focal.y.value = prevFocal.y.value + (centerY.value - initialFocal.y.value) * (scale.value - prevScale.value)
    })
    .onEnd(() => {
      moveIntoView()
    })

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDuration(250)
    .onStart((event) => {
      if (scale.value === 1) {
        isActive.value = true
        scale.value = withTiming(DOUBLE_ZOOM)
        focal.x.value = withTiming((centerX.value - event.x) * (DOUBLE_ZOOM - 1))
        focal.y.value = withTiming((centerY.value - event.y) * (DOUBLE_ZOOM - 1))
      } else {
        prevScale.value = 1
        scale.value = withTiming(1, undefined, () => {
          isActive.value = false
        })
        initialFocal.x.value = 0
        initialFocal.y.value = 0
        prevFocal.x.value = 0
        prevFocal.y.value = 0
        focal.x.value = withTiming(0)
        focal.y.value = withTiming(0)
        prevTranslate.x.value = 0
        prevTranslate.y.value = 0
        translate.x.value = withTiming(0)
        translate.y.value = withTiming(0)
      }
    })

  const styles = useAnimatedStyle(() => {
    return {
      zIndex: isActive.value ? 10 : 0,
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { translateX: focal.x.value },
        { translateY: focal.y.value },
        { scale: scale.value },
      ],
    }
  })

  const buttonStyles = useAnimatedStyle(() => {
    return {
      opacity: isActive.value ? 0 : 1,
    }
  })
  const gestures = Gesture.Race(doubleTapGesture, pinchGesture, panGesture)

  return (
    <ScreenView
      title={data ? <Text className="opacity-70">{dayjs(data.timestamp).format("DD MMM YYYY HH:MM")}</Text> : ""}
      containerClassName="px-0"
      rightElement={
        imageId && (
          <View className="flex flex-row space-x-3">
            {data && me?.id !== data?.creatorId && (
              <TouchableOpacity className="p-1" onPress={handleDownload}>
                <Icon icon={Download} size={18} />
              </TouchableOpacity>
            )}
            {/* <Link asChild push href={`/(home)/(trips)/trips/${id}/images/${imageId || ""}/edit`}>
              <TouchableOpacity className="px-1">
                <Icon icon={MessageCircleHeart} size={18} />
              </TouchableOpacity>
            </Link> */}
            <TouchableOpacity className="p-1" onPress={handleRemove} disabled={removeLoading}>
              <Icon icon={Trash} size={18} />
            </TouchableOpacity>
          </View>
        )
      }
    >
      {isLoading || !data ? null : (
        <View className="relative flex-1 pb-2">
          {data.mediaType === "VIDEO" ? (
            <View>
              <TouchableWithoutFeedback
                onPress={() =>
                  // @ts-ignore
                  status?.isPlaying ? video.current?.pauseAsync() : video.current?.playAsync()
                }
              >
                <Video
                  ref={video}
                  style={{ height: "100%", width: "100%" }}
                  source={{ uri: createImageUrl(data.path) }}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  onPlaybackStatusUpdate={(status) => setStatus(status)}
                />
                <View className="absolute w-full h-full flex items-center justify-center">
                  {
                    // @ts-ignore
                    status?.isBuffering ? (
                      <Spinner />
                    ) : (
                      status?.isLoaded &&
                      !status?.isPlaying && (
                        <View className="rounded-full h-[60px] w-[60px] flex items-center justify-center bg-gray-600">
                          <Icon icon={Play} size={24} fill="white" stroke="white" className="ml-1" />
                        </View>
                      )
                    )
                  }
                </View>
              </TouchableWithoutFeedback>
            </View>
          ) : (
            <GestureDetector gesture={gestures}>
              <Animated.View style={[styles, { flex: 1 }]} onLayout={onImageLayout}>
                <Image source={{ uri: createImageUrl(data.path) }} className="h-full flex-1" contentFit="contain" />
              </Animated.View>
            </GestureDetector>
          )}
          {(!data.latitude || !data.longitude) && (
            <Animated.View
              style={buttonStyles}
              className="absolute top-4 right-0 left-0 flex items-center justify-center"
              pointerEvents="box-none"
            >
              <Link push href={`/(home)/(trips)/trips/${id}/images/${imageId}/add-location`} asChild>
                <Button
                  size="xs"
                  leftIcon={<Icon icon={MapPin} size={16} color={{ dark: "black", light: "white" }} />}
                  className="rounded-full"
                >
                  Add to map
                </Button>
              </Link>
            </Animated.View>
          )}
        </View>
      )}
    </ScreenView>
  )
}
