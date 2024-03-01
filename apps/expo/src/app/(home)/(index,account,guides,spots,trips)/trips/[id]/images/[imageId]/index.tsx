import { useLocalSearchParams, useRouter } from "expo-router"
import { Trash } from "lucide-react-native"
import * as React from "react"
import { Alert, LayoutChangeEvent, TouchableOpacity, View } from "react-native"

import { createImageUrl } from "@ramble/shared"
import dayjs from "dayjs"
import { Image } from "expo-image"

import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { Icon } from "~/components/Icon"
import { ScreenView } from "~/components/ui/ScreenView"
import { Text } from "~/components/ui/Text"
import { toast } from "~/components/ui/Toast"
import { api } from "~/lib/api"
import { height, width } from "~/lib/device"

const clamp = (value: number, min: number, max: number): number => {
  "worklet"
  return Math.min(Math.max(min, value), max)
}

const DOUBLE_ZOOM = 3

export default function TripImage() {
  const { imageId, bounds } = useLocalSearchParams<{ id: string; imageId?: string; bounds?: string }>()

  const parsedBounds = bounds?.split(",").map(Number)

  const { data, isLoading } = api.trip.media.byId.useQuery(
    { id: imageId! },
    { enabled: !!imageId, staleTime: Infinity, cacheTime: Infinity },
  )

  const router = useRouter()
  const utils = api.useUtils()
  const { mutate, isLoading: removeLoading } = api.trip.media.remove.useMutation({
    onSuccess: () => {
      if (parsedBounds && imageId) {
        utils.trip.media.byBounds.setData({ bounds: parsedBounds }, (prev) =>
          prev ? prev.filter((media) => media.id !== imageId) : prev,
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

  // const handleDownload = async () => {
  //   try {
  //     if (!data) return
  //     // const file = await FileSystem.downloadAsync(createImageUrl(data.path), FileSystem.documentDirectory + data.path)
  //     // await MediaLibrary.saveToLibraryAsync(file.uri)
  //   } catch (error) {
  //     console.log(error)
  //     toast({ title: "Failed to download image", type: "error" })
  //   }
  // }

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
      scale.value = withTiming(1)
      translate.x.value = withTiming(0)
      focal.x.value = withTiming(0)
      translate.y.value = withTiming(0)
      focal.y.value = withTiming(0)
    }
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
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
        scale.value = withTiming(DOUBLE_ZOOM)
        focal.x.value = withTiming((centerX.value - event.x) * (DOUBLE_ZOOM - 1))
        focal.y.value = withTiming((centerY.value - event.y) * (DOUBLE_ZOOM - 1))
      } else {
        prevScale.value = 1
        scale.value = withTiming(1)
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
      transform: [
        { translateX: translate.x.value },
        { translateY: translate.y.value },
        { translateX: focal.x.value },
        { translateY: focal.y.value },
        { scale: scale.value },
      ],
    }
  })

  const simultaneousGestures = Gesture.Simultaneous(pinchGesture, panGesture)
  const gestures = Gesture.Race(doubleTapGesture, simultaneousGestures)

  return (
    <ScreenView
      title={data ? <Text className="opacity-70">{dayjs(data.timestamp).format("DD MMM YYYY HH:MM")}</Text> : ""}
      containerClassName="px-0"
      rightElement={
        imageId && (
          <View className="space-x-4 flex flex-row">
            {/* {data && me?.id === data?.creatorId && (
            <TouchableOpacity className="px-1" onPress={handleDownload}>
              <Icon icon={Download} size={18} />
            </TouchableOpacity>
          )} */}
            {/* <Link asChild push href={`/(home)/(trips)/trips/${id}/images/${imageId || ""}/edit`}>
              <TouchableOpacity className="px-1">
                <Icon icon={MessageCircleHeart} size={18} />
              </TouchableOpacity>
            </Link> */}
            <TouchableOpacity className="px-1" onPress={handleRemove} disabled={removeLoading}>
              <Icon icon={Trash} size={18} />
            </TouchableOpacity>
          </View>
        )
      }
    >
      {isLoading || !data ? null : (
        <View className="pb-2 flex-1">
          <GestureDetector gesture={gestures}>
            <Animated.View style={[styles, { flex: 1 }]} onLayout={onImageLayout}>
              <Image source={{ uri: createImageUrl(data.path) }} className="flex-1 h-full" contentFit="contain" />
            </Animated.View>
          </GestureDetector>
        </View>
      )}
    </ScreenView>
  )
}
