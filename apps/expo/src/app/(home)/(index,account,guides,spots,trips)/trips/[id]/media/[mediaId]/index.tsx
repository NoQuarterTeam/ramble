import * as Sentry from "@sentry/react-native"
import dayjs from "dayjs"
import { Audio, ResizeMode, Video } from "expo-av"
import type { AVPlaybackStatus } from "expo-av"
import * as FileSystem from "expo-file-system"
import { Image } from "expo-image"
import * as MediaLibrary from "expo-media-library"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { Download, MapPin, Pause, Play, Trash, Volume2, VolumeX } from "lucide-react-native"
import * as React from "react"
import { Alert, type LayoutChangeEvent, TouchableOpacity, View } from "react-native"
import { Gesture, GestureDetector, TouchableWithoutFeedback } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

import { createAssetUrl } from "@ramble/shared"

import { Icon } from "~/components/Icon"
import { Button } from "~/components/ui/Button"
import { ScreenView } from "~/components/ui/ScreenView"
import { Spinner } from "~/components/ui/Spinner"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { height, isAndroid, width } from "~/lib/device"
import { useMe } from "~/lib/hooks/useMe"

const clamp = (value: number, min: number, max: number): number => {
  "worklet"
  return Math.min(Math.max(min, value), max)
}

const DOUBLE_ZOOM = 3

export default function TripImage() {
  const { me } = useMe()
  const { id, mediaId, bounds } = useLocalSearchParams<{ id: string; mediaId?: string; bounds?: string }>()

  const video = React.useRef<Video>(null)
  const [status, setStatus] = React.useState<AVPlaybackStatus | undefined>()
  const [isMuted, setIsMuted] = React.useState(false)

  const parsedBounds = bounds?.split(",").map(Number)

  const { data, isLoading } = api.trip.media.byId.useQuery(
    { id: mediaId! },
    { enabled: !!mediaId, staleTime: Number.POSITIVE_INFINITY },
  )

  const router = useRouter()

  const utils = api.useUtils()
  const { mutate, isPending: removeLoading } = api.trip.media.remove.useMutation({
    onSuccess: () => {
      if (!mediaId) return
      void utils.trip.detail.refetch({ id })
      if (parsedBounds) {
        utils.trip.media.byBounds.setData({ tripId: id, skip: 0, bounds: parsedBounds }, (prev) =>
          prev ? { total: prev.total - 1, items: prev.items.filter((media) => media.id !== mediaId) } : prev,
        )
      } else {
        utils.trip.media.all.setData({ tripId: id, skip: 0 }, (prev) =>
          prev ? { total: prev.total - 1, items: prev.items.filter((media) => media.id !== mediaId) } : prev,
        )
      }
      router.back()
    },
    onError: () => {
      toast({ title: "Failed to remove image", type: "error" })
    },
  })

  const handleRemove = async () => {
    if (!mediaId) return
    Alert.alert("Are you sure?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => mutate({ id: mediaId }) },
    ])
  }

  const handleDownload = async () => {
    try {
      if (!data) return
      const file = await FileSystem.downloadAsync(createAssetUrl(data.path), FileSystem.documentDirectory + data.path)
      await MediaLibrary.saveToLibraryAsync(file.uri)
    } catch (error) {
      Sentry.captureException(error)
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
  const pressGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      isActive.value = !isActive.value
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
      opacity: withTiming(isActive.value ? 0 : 1),
    }
  })
  const gestures = Gesture.Race(Gesture.Exclusive(doubleTapGesture, pressGesture), pinchGesture, panGesture)

  React.useEffect(() => {
    if (data?.type === "VIDEO" && !isAndroid) {
      Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
    }
  }, [data])

  const handleVideoPlayPause = async () => {
    if (!status?.isLoaded) return
    if (status?.isPlaying) {
      video.current?.pauseAsync()
    } else {
      video.current?.playAsync()
    }
  }

  return (
    <ScreenView
      title={data ? <Text className="text-sm">{dayjs(data.timestamp).format("DD MMM YYYY HH:MM")}</Text> : ""}
      containerClassName="px-0"
    >
      {isLoading || !data ? null : (
        <View className="relative flex-1">
          <GestureDetector gesture={gestures}>
            <Animated.View style={[styles, { flex: 1 }]} onLayout={onImageLayout}>
              {data.type === "VIDEO" ? (
                <Video
                  ref={video}
                  style={{ width: "100%", minHeight: "100%" }}
                  source={{ uri: createAssetUrl(data.path) }}
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                  onPlaybackStatusUpdate={setStatus}
                  isMuted={isMuted}
                />
              ) : (
                <Image source={{ uri: createAssetUrl(data.path) }} className="h-full flex-1" contentFit="contain" />
              )}
            </Animated.View>
          </GestureDetector>
          <Animated.View
            style={buttonStyles}
            className="flex flex-row border-t border-gray-100 dark:border-gray-800 justify-between items-center px-4 py-2 bg-background dark:bg-background-dark"
          >
            <View className="flex-1">
              {(!data.latitude || !data.longitude) && (
                <Link push href={`/(home)/(trips)/trips/${id}/media/${mediaId}/add-location`} asChild>
                  <Icon icon={MapPin} size={20} />
                </Link>
              )}
            </View>
            {data.type === "VIDEO" && (
              <View className="flex-1 justify-center flex items-center flex-row space-x-6">
                {status?.isLoaded && (
                  <TouchableWithoutFeedback onPress={handleVideoPlayPause}>
                    <Icon icon={status.isPlaying ? Pause : Play} size={18} />
                  </TouchableWithoutFeedback>
                )}
                {status?.isLoaded && (
                  <TouchableWithoutFeedback onPress={() => setIsMuted((isMuted) => !isMuted)}>
                    <Icon icon={status.isMuted ? VolumeX : Volume2} size={22} />
                  </TouchableWithoutFeedback>
                )}
              </View>
            )}
            <View className="flex-1 flex items-center justify-end flex-row space-x-3">
              {data && me?.id !== data?.creatorId && (
                <TouchableOpacity className="p-1" onPress={handleDownload}>
                  <Icon icon={Download} size={18} />
                </TouchableOpacity>
              )}
              <TouchableOpacity className="p-1" onPress={handleRemove} disabled={removeLoading}>
                <Icon icon={Trash} size={18} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      )}
    </ScreenView>
  )
}
